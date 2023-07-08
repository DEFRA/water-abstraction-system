'use strict'

/**
 * Fetch all records from the table provided
 * @module FetchTableService
 */

const { db } = require('../../../../db/db.js')

/**
 * Retrieves headers, rows and the table name from the table in the db, and returns them as an object
 * @param {String} tableName The name of the table to retrieve
 * @param {string} schemaName The schema that the table belongs to
 *
 * @returns {Object} The headers, rows and table name from the table
 */
async function go (tableName, schemaName) {
  const data = {
    headers: await _headers(tableName, schemaName),
    rows: await _rows(tableName, schemaName),
    tableName
  }

  return data
}

async function _rows (tableName, schemaName) {
  // Retrieves all rows from the table
  const rows = await db
    .withSchema(schemaName)
    .select('*')
    .from(tableName)

  // We are only interested in the values from the table
  return rows.map((row) => {
    return Object.values(row)
  })
}

async function _headers (tableName, schemaName) {
  const columns = await db(tableName).withSchema(schemaName).columnInfo()

  // We are only interested in the column names
  return Object.keys(columns)
}

module.exports = {
  go
}
