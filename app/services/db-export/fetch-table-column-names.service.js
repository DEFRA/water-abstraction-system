'use strict'

/**
 * This module provides a service that fetches the column names of a specific table from a database.
 * @module FetchTableColumnNamesService
 */

const { db } = require('../../../db/db.js')

/**
 * Fetches the column names of a specific table from a database
 * @async
 * @function go
 * @returns {Promise<Array<string>>} - An array containing the column names of the table
 */
async function go () {
  const columnNames = await db('billingChargeCategories').withSchema('water').columnInfo()
  return _generateHeader(columnNames)
}

/**
 * Generates a formatted header for the column names.
 * @private
 * @function _generateHeader
 * @param {Object} columnNames - An object containing the column names.
 * @returns {String} - A string representing the formatted header for the column names
 */
function _generateHeader (columnNames) {
  const columnNameArray = Object.keys(columnNames)
  const formattedColumnNames = columnNameArray.map((column) => {
    return `"${column}"`
  })
  return formattedColumnNames.join(',')
}

module.exports = {
  go
}
