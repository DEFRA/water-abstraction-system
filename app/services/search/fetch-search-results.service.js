'use strict'

/**
 * Handles fetching a list of matching search results for the /search page
 * @module FetchSearchResultsService
 */

const DatabaseConfig = require('../../../config/database.config.js')

const { db } = require('../../../db/db.js')

const BILLING_ACCOUNT_SQL = `
  SELECT
    'billingAccount' AS row_type,
    id AS row_uu_id,
    CAST (NULL AS INT) AS row_int_id,
    account_number ILIKE ? AS exact,
    5 AS table_order,
    account_number AS row_order,
    CAST (NULL AS DATE) AS date_order
  FROM billing_accounts
  WHERE account_number ILIKE ?
`

// The database tables don't use consistent field types as identifiers, so we need to know which field to use for each
// type of record
const ID_FIELD_FOR_TABLE = {
  billingAccount: 'row_uu_id',
  company: 'row_uu_id',
  licence: 'row_uu_id',
  monitoringStation: 'row_uu_id',
  returnLog: 'row_uu_id',
  user: 'row_int_id'
}

const COMPANY_SQL = `
  SELECT
    'company' AS row_type,
    c.id AS row_uu_id,
    CAST (NULL AS INT) AS row_int_id,
    c."name" ILIKE ? AS exact,
    2 AS table_order,
    LOWER(c."name") AS row_order,
    CAST (NULL AS DATE) AS date_order
  FROM companies c
  WHERE c."name" ILIKE ?
`

const LICENCE_SQL = `
  SELECT
    'licence' AS row_type,
    id AS row_uu_id,
    CAST (NULL AS INT) AS row_int_id,
    licence_ref ILIKE ? AS exact,
    1 AS table_order,
    licence_ref AS row_order,
    CAST (NULL AS DATE) AS date_order
  FROM licences
  WHERE licence_ref ILIKE ?
`

const MONITORING_STATION_SQL = `
  SELECT
    'monitoringStation' AS row_type,
    id AS row_uu_id,
    CAST (NULL AS INT) AS row_int_id,
    label ILIKE ? AS exact,
    3 AS table_order,
    label AS row_order,
    CAST (NULL AS DATE) AS date_order
  FROM monitoring_stations
  WHERE label ILIKE ?
`

const RETURN_LOG_SQL = `
  SELECT
    'returnLog' AS row_type,
    id AS row_uu_id,
    CAST (NULL AS INT) AS row_int_id,
    return_reference ILIKE ? AS exact,
    4 AS table_order,
    CONCAT(return_reference, ' ', licence_ref, ' ') AS row_order,
    end_date AS date_order
  FROM return_logs
  WHERE return_reference ILIKE ?
`

const USER_SQL = `
  SELECT
    'user' AS row_type,
    CAST (NULL AS UUID) AS row_uu_id,
    id AS row_int_id,
    username ILIKE ? AS exact,
    6 AS table_order,
    username AS row_order,
    CAST (NULL AS DATE) AS date_order
  FROM users
  WHERE
    application = 'water_vml'
    AND username ILIKE ?
`

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
  _companySql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _licenceSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _monitoringStationSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _returnLogSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)
  _userSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery)

  const searchSql =
    searchSqls.statements.join('UNION ALL') +
    'ORDER BY exact DESC, table_order ASC, row_order ASC, date_order DESC LIMIT ? OFFSET ?'

  searchSqls.params.push(DatabaseConfig.defaultPageSize, (page - 1) * DatabaseConfig.defaultPageSize)

  const countSql = `SELECT ${countSqls.statements.join('+')} AS total`

  return { countParams: countSqls.params, countSql, searchParams: searchSqls.params, searchSql }
}

function _billingAccountSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('billingAccount')) {
    searchSqls.statements.push(BILLING_ACCOUNT_SQL)
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

function _companySql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('company')) {
    searchSqls.statements.push(COMPANY_SQL)
    searchSqls.params.push(exactQuery, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM companies c WHERE c."name" ILIKE ?)
    `)
    countSqls.params.push(partialQuery)
  }
}

function _licenceSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('licence')) {
    searchSqls.statements.push(LICENCE_SQL)
    searchSqls.params.push(exactQuery, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM licences WHERE licence_ref ILIKE ?)
    `)
    countSqls.params.push(partialQuery)
  }
}

function _monitoringStationSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('monitoringStation')) {
    searchSqls.statements.push(MONITORING_STATION_SQL)
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
    const id = row[ID_FIELD_FOR_TABLE[type]]

    return {
      exact,
      id,
      type
    }
  })
}

function _returnLogSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('returnLog')) {
    searchSqls.statements.push(RETURN_LOG_SQL)
    searchSqls.params.push(exactQuery, partialQuery)

    countSqls.statements.push(`
      (SELECT COUNT(*) FROM return_logs WHERE return_reference ILIKE ?)
    `)
    countSqls.params.push(partialQuery)
  }
}

function _userSql(resultTypes, searchSqls, countSqls, exactQuery, partialQuery) {
  if (resultTypes.includes('user')) {
    searchSqls.statements.push(USER_SQL)
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
