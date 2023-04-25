'use strict'

/**
 * Fetch all records from the water.billing_charge_categories table
 * @module FetchBillingChargeCategoriesService
 */

const { db } = require('../../../db/db.js')

/**
 * Generates an array of the column names and data from the table billing_charge_categories
 *
 * This is a dump of running 'SELECT * FROM water.billing_charge_categories' for the database.
 *
 * @returns An array of the tables column names and data
 */
async function go () {
  const data = [await _headers(), await _rows()]
  return data
}

async function _rows () {
  return db
    .withSchema('water')
    .select('*')
    .from('billingChargeCategories')
}

async function _headers () {
  return db('billingChargeCategories').withSchema('water').columnInfo()
}

module.exports = {
  go
}
