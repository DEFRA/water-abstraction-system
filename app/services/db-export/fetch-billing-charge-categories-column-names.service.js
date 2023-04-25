'use strict'

/**
 * This module provides a service that fetches the column names of a specific table from a database.
 * @module FetchBillingChargeCategoriesColumnNames
 */

const { db } = require('../../../db/db.js')

/**
 * Fetches the column names of a specific table from a database
 * @async
 * @function go
 * @returns {Promise<Array<string>>} - An array containing the column names of the table
 */
async function go () {
  return db('billingChargeCategories').withSchema('water').columnInfo()
}

module.exports = {
  go
}
