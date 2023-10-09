'use strict'

/**
 * @module ChargeVersionHelper
 */

const ChargeVersionModel = require('../../../../app/models/water/charge-version.model.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('./licence.helper.js')

/**
 * Add a new charge version
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - [randomly generated - 01/123]
 * - `scheme` - sroc
 * - `startDate` - 2022-04-01
 * - `invoiceAccountId` - [random UUID]
 * - `status` - current
 * - `licenceId` - [random UUID]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ChargeVersionModel} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return ChargeVersionModel.query()
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
    licenceRef: generateLicenceRef(),
    scheme: 'sroc',
    startDate: new Date('2022-04-01'),
    invoiceAccountId: generateUUID(),
    status: 'current',
    licenceId: generateUUID()
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
