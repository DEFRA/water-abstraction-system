'use strict'

/**
 * @module BillRunVolumeHelper
 */

const BillRunVolumeModel = require('../../../app/models/bill-run-volume.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new bill run volume
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeReferenceId` - [random UUID]
 * - `financialYear` - 2023
 * - `summer` - false
 * - `billRunId` - [random UUID]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:BillRunModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillRunVolumeModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    chargeReferenceId: generateUUID(),
    financialYear: 2023,
    summer: false,
    billRunId: generateUUID()
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
