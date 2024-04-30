'use strict'

/**
 * @module LicenceAgreementHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceAgreementModel = require('../../../app/models/licence-agreement.model.js')
const LicenceHelper = require('./licence.helper.js')

/**
 * Add a new licence agreement
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceAgreementId` - [random UUID]
 * - `licenceRef` - [randomly generated - 01/123]
 * - `startDate` - 2023-01-01
 * - `endDate` - 2023-12-31
 * - `dateSigned` - 2022-12-31
 * - `source` - 'nald'
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceAgreementModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceAgreementModel.query()
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
    id: generateUUID(),
    licenceRef: LicenceHelper.generateLicenceRef(),
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    dateSigned: new Date('2022-01-01'),
    source: 'nald'
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
