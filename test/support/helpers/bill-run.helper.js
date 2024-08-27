'use strict'

/**
 * @module BillRunHelper
 */

const BillRunModel = require('../../../app/models/bill-run.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new bill run
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `regionId` - [random UUID]
 * - `batchType` - supplementary
 * - `fromFinancialYearEnding` - 2023
 * - `toFinancialYearEnding` - 2023
 * - `status` - queued
 * - `scheme` - sroc
 * - `source` - wrls
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:BillRunModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillRunModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults (data = {}) {
  const defaults = {
    regionId: generateUUID(),
    batchType: 'supplementary',
    fromFinancialYearEnding: 2023,
    toFinancialYearEnding: 2023,
    status: 'queued',
    scheme: 'sroc',
    source: 'wrls'
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add,
  defaults
}
