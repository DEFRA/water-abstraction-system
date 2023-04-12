'use strict'

/**
 * Used by the 'root.controller' currently to determine if we are pulling
 * the billing_charge_categories table correctly
 * @module BillingChargeCategoriesTableExportService
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

async function getBillingChargeCategoriesTable () {
  return db
    .select('*')
    .from('water.billing_charge_categories')
    .then(rows => rows)
}

module.exports = {
  getBillingChargeCategoriesTable
}
