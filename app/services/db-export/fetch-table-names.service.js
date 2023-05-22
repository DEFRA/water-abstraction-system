'use strict'

/** Fetches all the table names from a given schema
 * @module FetchTableNames
 */

const { db } = require('../../../db/db.js')

/**
 * Retrieves the table names for a specific schema by making a database call
 *
 * @param schemaName The name of the schema from which to fetch the
 * table names
 *
 * @returns {Array} An array containing the table names for the specified schema
 */
async function go (schemaName) {
  const tableData = await _fetchTableNames(schemaName)

  const tableNames = _pluckTableNames(tableData.rows)

  return tableNames
}

/**
 * fetchTableNames is connecting the the db and querying the schema for its information
 *
 * @param {*} schemaName The name of the schema from which we want to retrieve the table names
 *
 * @returns {Array} An array of objects containing both the table names and
 * additional information that is not relevant to our needs
 */
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
