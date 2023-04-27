'use strict'

/**
 * Fetch all records from the water.billing_charge_categories table
 * @module FetchBillingChargeCategoriesService
 */

const { db } = require('../../../db/db.js')

/**
 * Retrieves headers and rows from the table in the db, and returns them as an object
 *
 * @returns {Object} The headers and rows from the table
 */
async function go () {
  const data = {
    headers: await _headers(),
    rows: await _rows()
  }

  return data
}

async function _rows () {
  // Retrieves all rows from the water.billingChargeCategories table
  const rows = await db
    .withSchema('water')
    .select('*')
    .from('billingChargeCategories')

  // We are only interested in the values from the table
  return rows.map((row) => {
    return Object.values(row)
  })
}

async function _headers () {
  const columns = await db('billingChargeCategories').withSchema('water').columnInfo()

  // We are only interested in the column names
  return Object.keys(columns)
}

module.exports = {
  go
}
