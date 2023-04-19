'use strict'

/**
 * Fetch all records from the water.billing_charge_categories table
 * @module FetchBillingChargeCategoriesService
 */

const { db } = require('../../../db/db.js')

/**
 * Generates an array of the table billing_charge_categories
 *
 * This is a dump of running 'SELECT * FROM water.billing_charge_categories' for the database.
 * Its part of the full db schema export work.
 *
 * @returns An array of objects containing the data from the table.
 */
async function go () {
  return db
    .select('*')
    .from('water.billing_charge_categories')
}

module.exports = {
  go
}
