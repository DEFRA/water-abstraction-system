'use strict'

/**
 * @module ChargeInformationHelper
 */

const ChargeInformationModel = require('../../../../app/models/water/charge-information.model.js')

/**
 * Add a new charge information
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - 01/123
 * - `scheme` - sroc
 * - `startDate` - 2022-04-01
 * - `invoiceAccountId` - 01931031-4680-4950-87d6-50f8fe784f6d
 * - `status` - current
 * - `licenceId` - 4c9d2d86-fc88-4fb6-b49d-8a30f52f7997
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ChargeInformationModel} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return ChargeInformationModel.query()
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
    licenceRef: '01/123',
    scheme: 'sroc',
    startDate: new Date('2022-04-01'),
    invoiceAccountId: '01931031-4680-4950-87d6-50f8fe784f6d',
    status: 'current',
    licenceId: '4c9d2d86-fc88-4fb6-b49d-8a30f52f7997'
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
