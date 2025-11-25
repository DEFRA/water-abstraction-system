'use strict'

/**
 * Handles fetching a list of matching search results for the /search page
 * @module FetchSearchResultsService
 */

const DatabaseConfig = require('../../../config/database.config.js')

const { db } = require('../../../db/db.js')

// The database tables don't use consistent field types as identifiers, so we need to know which field to use for each
// type of record
const ID_FIELDS = {
  billingAccount: 'row_uu_id',
  licenceHolder: 'row_text_id',
  licence: 'row_uu_id',
  monitoringStation: 'row_uu_id',
  // returnLog does have a UUID but currently the defined ID field is a text field
  returnLog: 'row_text_id',
  user: 'row_int_id'
}

// Knex doesn't fully support/understand PostgreSQL JSONB path query syntax, so any question marks in the query get
// interpreted by Knex as placeholders for query parameters, which it then replaces with whatever actual parameter value
// we have provided to the query.
// To prevent this, we define a placeholder parameter for the JSONB path query in our main query and then pass this
// JSONB path query in as the parameter value.
const LICENCE_HOLDER_ROLE_JSONB_PATH_QUERY = '$[*] ? (@.role == "Licence holder")'

/**
 * Handles fetching a list of matching search results for the /search page
 *
 * This function retrieves a page of records containing the unique identifiers of any records that match the search
 * query. These identifiers can be for different types of record and can be used to fetch the full record details as
 * required, for display on the search page.
 *
 * In keeping with the standard Objection pagination approach, the total number of matching records in the database is
 * also returned.
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {string[]} resultTypes - The types of record to search for
 * @param {number} page - The requested page
 *
 * @returns {Promise<object>} The list of IDs of the records by search order and the total number of matching rows that
 * exist in the database
 */
async function go(query, resultTypes, page) {
  if (resultTypes.length === 0) {
    return { results: [], total: 0 }
  }

  const exactQuery = _exactQuery(query)
  const partialQuery = `%${exactQuery}%`

  const { countParams, countSql, searchParams, searchSql } = _allSql(exactQuery, partialQuery, resultTypes, page)

  const [countResult, searchResult] = await Promise.all([
    db.raw(countSql, countParams),
    db.raw(searchSql, searchParams)
  ])

  const { total } = countResult.rows[0]
  const { rows } = searchResult

  const results = _results(rows)

  return { results, total }
}

function _allSql(exactQuery, partialQuery, resultTypes, page) {
  const countSqls = { statements: [], params: [] }

  const searchSqls = { statements: [], params: [] }

  _billingAccountSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _licenceHolderSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _licenceSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _monitoringStationSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _returnLogSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _userSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)

  const searchSql =
    searchSqls.statements.join('UNION ALL') +
    'ORDER BY exact DESC, table_order ASC, row_order ASC, date_order DESC LIMIT ? OFFSET ?'

  searchSqls.params.push(DatabaseConfig.defaultPageSize, (page - 1) * DatabaseConfig.defaultPageSize)

  const countSql = 'SELECT' + countSqls.statements.join('+') + 'AS total'

  return { countParams: countSqls.params, countSql, searchParams: searchSqls.params, searchSql }
}

function _billingAccountSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('billingAccount')) {
    searchSqls.statements.push(`
      SELECT
        'billingAccount' AS row_type,
        id AS row_uu_id,
        NULL AS row_text_id,
        CAST (NULL AS INT) AS row_int_id,
        account_number ILIKE ? AS exact,
        5 AS table_order,
        account_number AS row_order,
        CAST (NULL AS DATE) AS date_order
      FROM billing_accounts
      WHERE account_number ILIKE ?
    `)
    searchSqls.params.push(exactQuery, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM billing_accounts WHERE account_number ILIKE ?)
    `)
    countSqls.params.push(partialQuery)
  }
}

function _exactQuery(query) {
  return query
    .replaceAll('\\', '\\\\')
    .replaceAll('%', String.raw`\%`)
    .replaceAll('_', String.raw`\_`)
}

function _licenceHolderSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('licenceHolder')) {
    searchSqls.statements.push(`
      SELECT
        'licenceHolder' AS row_type,
        CAST (NULL AS UUID) AS row_uu_id,
        id AS row_text_id,
        CAST (NULL AS INT) AS row_int_id,
        dh.holder->>'name' ILIKE ? AS exact,
        2 AS table_order,
        CONCAT(
          LOWER(dh.holder->>'name'), ' ',
          LOWER(COALESCE(dh.holder->>'forename', dh.holder->>'initials')), ' ',
          LOWER(dh.holder->>'salutation'
        ), dh.licence_ref) AS row_order,
        CAST (NULL AS DATE) AS date_order
      FROM (
        SELECT id, licence_ref, jsonb_path_query_first(metadata->'contacts', ?) AS holder
        FROM licence_document_headers
      ) dh
      WHERE dh.holder->>'name' ILIKE ?
    `)
    searchSqls.params.push(exactQuery, LICENCE_HOLDER_ROLE_JSONB_PATH_QUERY, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM licence_document_headers WHERE jsonb_path_query_first(metadata->'contacts', ?)->>'name' ILIKE ?)
    `)
    countSqls.params.push(LICENCE_HOLDER_ROLE_JSONB_PATH_QUERY, partialQuery)
  }
}

function _licenceSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('licence')) {
    searchSqls.statements.push(`
      SELECT
        'licence' AS row_type,
        id AS row_uu_id,
        NULL AS row_text_id,
        CAST (NULL AS INT) AS row_int_id,
        licence_ref ILIKE ? AS exact,
        1 AS table_order,
        licence_ref AS row_order,
        CAST (NULL AS DATE) AS date_order
      FROM licences
      WHERE licence_ref ILIKE ?
    `)
    searchSqls.params.push(exactQuery, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM licences WHERE licence_ref ILIKE ?)
    `)
    countSqls.params.push(partialQuery)
  }
}

function _monitoringStationSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('monitoringStation')) {
    searchSqls.statements.push(`
      SELECT
        'monitoringStation' AS row_type,
        id AS row_uu_id,
        NULL AS row_text_id,
        CAST (NULL AS INT) AS row_int_id,
        label ILIKE ? AS exact,
        3 AS table_order,
        label AS row_order,
        CAST (NULL AS DATE) AS date_order
      FROM monitoring_stations
      WHERE label ILIKE ?
    `)
    searchSqls.params.push(exactQuery, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM monitoring_stations WHERE label ILIKE ?)
    `)
    countSqls.params.push(partialQuery)
  }
}

function _results(rows) {
  return rows.map((row) => {
    const { exact, row_type: type } = row
    const id = row[ID_FIELDS[type]]

    return {
      exact,
      id,
      type
    }
  })
}

function _returnLogSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('returnLog')) {
    searchSqls.statements.push(`
      SELECT
        'returnLog' AS row_type,
        return_id AS row_uu_id,
        id AS row_text_id,
        CAST (NULL AS INT) AS row_int_id,
        return_reference ILIKE ? AS exact,
        4 AS table_order,
        CONCAT(return_reference, ' ', licence_ref, ' ') AS row_order,
        end_date AS date_order
      FROM return_logs
      WHERE return_reference ILIKE ?
    `)
    searchSqls.params.push(exactQuery, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM return_logs WHERE return_reference ILIKE ?)
    `)
    countSqls.params.push(partialQuery)
  }
}

function _userSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('user')) {
    searchSqls.statements.push(`
      SELECT
        'user' AS row_type,
        CAST (NULL AS UUID) AS row_id,
        NULL AS record_id,
        id AS row_int_id,
        username ILIKE ? AS exact,
        6 AS table_order,
        username AS row_order,
        CAST (NULL AS DATE) AS date_order
      FROM users
      WHERE username ILIKE ?
    `)
    searchSqls.params.push(exactQuery, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM users WHERE username ILIKE ?)
    `)
    countSqls.params.push(partialQuery)
  }
}

module.exports = {
  go
}
