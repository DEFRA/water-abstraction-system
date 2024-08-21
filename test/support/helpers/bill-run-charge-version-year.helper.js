'use strict'

/**
 * @module BillRunChargeVersionYearHelper
 */

const BillRunChargeVersionYearModel = require('../../../app/models/bill-run-charge-version-year.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new bill run charge version year record
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `billRunId` - [random UUID]
 * - `chargeVersionId` - [random UUID]
 * - `financialYearEnding` - 2024
 * - `batchType` - annual
 * - `summer` - false
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:BillRunChargeVersionYearModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillRunChargeVersionYearModel.query()
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
    billRunId: generateUUID(),
    chargeVersionId: generateUUID(),
    financialYearEnding: 2024,
    status: 'ready',
    batchType: 'annual',
    summer: false
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
