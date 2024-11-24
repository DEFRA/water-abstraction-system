'use strict'

/**
 * Fetch the table headers and returns them alongside a db knex query to retrieve a full table
 * @module FetchTableService
 */

const { db } = require('../../../../db/db.js')

/**
 * Retrieves headers, a knex query for the table rows and the table name from the table in the db, and returns them as
 * an object
 *
 * @param {string} tableName - The name of the table to retrieve
 * @param {string} schemaName - The schema that the table belongs to
 *
 * @returns {Promise<object>} The headers, query and table name from the table
 */
async function go(tableName, schemaName) {
  const data = {
    headers: await _headers(tableName, schemaName),
    rows: _rows(tableName, schemaName)
  }

  return data
}

async function _rows(tableName, schemaName) {
  // Retrieves the input streams query
  return db.withSchema(schemaName).select('*').from(tableName).stream()
}

async function _headers(tableName, schemaName) {
  const columns = await db(tableName).withSchema(schemaName).columnInfo()

  // We are only interested in the column names
  return Object.keys(columns)
}

module.exports = {
  go
}
