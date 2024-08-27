'use strict'

/**
 * @module BillLicenceHelper
 */

const BillLicenceModel = require('../../../app/models/bill-licence.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceHelper = require('./licence.helper.js')

/**
 * Add a new bill licence
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `billId` - [random UUID]
 * - `licenceRef` - [randomly generated - 01/123]
 * - `licenceId` - [random UUID]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:BillLicenceModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return BillLicenceModel.query()
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
    billId: generateUUID(),
    licenceRef: LicenceHelper.generateLicenceRef(),
    licenceId: data.licenceId || generateUUID()
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
