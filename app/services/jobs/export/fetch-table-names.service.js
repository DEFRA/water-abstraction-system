'use strict'

/**
 * Fetches all the table names from a given schema
 * @module FetchTableNamesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Retrieves the table names for a specific schema
 *
 * @param schemaName The name of the schema from which to fetch the table names
 *
 * @returns {String[]} Table names for the specified schema
 */
async function go (schemaName) {
  const tableData = await _fetchTableNames(schemaName)

  // tableData has information we do not need
  const tableNames = _pluckTableNames(tableData.rows)

  if (tableNames.length === 0) {
    throw new Error('Error: Unable to fetch table names')
  }

  return tableNames
}

async function _fetchTableNames (schemaName) {
  const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${schemaName}'
        AND table_type = 'BASE TABLE';
    `

  return await db.raw(query)
}

function _pluckTableNames (tableData) {
  return tableData.map(obj => obj.table_name)
}

module.exports = {
  go
}
