'use strict'

/**
 * Handles fetching search results for licence holders on the /search page
 * @module FetchLicenceHolderSearchResultsService
 */

const DatabaseConfig = require('../../../config/database.config.js')

const { db } = require('../../../db/db.js')

// The value of the "role" attribute used to identify the licence holder
const LICENCE_HOLDER_ROLE = 'Licence holder'

/**
 * Handles fetching search results for licence holders on the /search page
 *
 * This function uses some raw SQL queries because the licence holder information is squirrelled away in a JSONB field
 * and the JSONB path querying required to query and extract the information is not fully supported by Knex.
 *
 * As a result, we have to build the SQL queries as text, recreate the paging functionality that Objection would provide
 * and handcraft the result fields into the expected format.
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 * @param {boolean} matchFullHolderName - Whether to perform a full match or just a partial match (the default)
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page, matchFullHolderName = false) {
  const fullHolderName = _fullHolderName(query)
  const partialHolderName = `%${fullHolderName}%`

  // The JSONB path query to extract licence holder contacts has to be passed in as a parameter to a raw query to
  // prevent the question mark being used as a placeholder for a query parameter as Knex doesn't support fully
  // support/understand PostgreSQL JSONB path query syntax
  const jsonbPathQuery = `$[*] ? (@.role == "${LICENCE_HOLDER_ROLE}")`

  const matchParams = [jsonbPathQuery]
  const pageParams = [DatabaseConfig.defaultPageSize, (page - 1) * DatabaseConfig.defaultPageSize]

  let searchSql = `
    SELECT licences.id,
           concat(dh.holder->>'salutation' || ' ', COALESCE(dh.holder->>'forename', dh.holder->>'initials') || ' ', dh.holder->>'name') AS "holderName",
           dh.holder->>'type' AS "holderType",
           dh.licence_ref AS "licenceRef"
    FROM (SELECT licence_ref, jsonb_path_query(metadata->'contacts', ?) AS holder FROM licence_document_headers) dh
    JOIN licences ON dh.licence_ref = licences.licence_ref
    WHERE dh.holder->>'name' ILIKE ?
    `

  let countSql = `
    SELECT COUNT(*) AS total
    FROM (SELECT licence_ref, jsonb_path_query(metadata->'contacts', ?) AS holder FROM licence_document_headers) dh
    JOIN licences ON dh.licence_ref = licences.licence_ref
    WHERE dh.holder->>'name' ILIKE ?
  `

  if (matchFullHolderName) {
    matchParams.push(fullHolderName)
  } else {
    searchSql += `AND NOT dh.holder->>'name' ILIKE ?`
    countSql += `AND NOT dh.holder->>'name' ILIKE ?`
    matchParams.push(partialHolderName)
    matchParams.push(fullHolderName)
  }

  searchSql += `
      ORDER BY
            LOWER(dh.holder->>'name') ASC,
            LOWER(COALESCE(dh.holder->>'forename', dh.holder->>'initials')) ASC,
            LOWER(dh.holder->>'salutation') ASC,
            dh.licence_ref ASC
    `
  if (!matchFullHolderName) {
    searchSql += `LIMIT ? OFFSET ?`
  }

  const searchParams = matchFullHolderName ? matchParams : [...matchParams, ...pageParams]

  const searchQueryResults = await db.raw(searchSql, searchParams)

  const countQueryResults = await db.raw(countSql, matchParams)
  const total = parseInt(countQueryResults.rows[0].total, 10)

  return {
    results: searchQueryResults.rows,
    total
  }
}

function _fullHolderName(query) {
  return query
    .replaceAll('\\', '\\\\')
    .replaceAll('%', String.raw`\%`)
    .replaceAll('_', String.raw`\_`)
}

module.exports = {
  go
}
