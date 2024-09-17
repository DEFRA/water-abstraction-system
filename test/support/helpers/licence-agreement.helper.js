'use strict'

/**
 * @module LicenceAgreementHelper
 */

const FinancialAgreementHelper = require('./financial-agreement.helper.js')
const LicenceAgreementModel = require('../../../app/models/licence-agreement.model.js')
const LicenceHelper = require('./licence.helper.js')

/**
 * Add a new licence agreement
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `financialAgreementId` - random financialAgreementId from financial agreement seed data
 * - `licenceRef` - [randomly generated - 01/123]
 * - `startDate` - 2023-01-01
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
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
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults (data = {}) {
  const { id: financialAgreementId } = FinancialAgreementHelper.select()

  const defaults = {
    financialAgreementId,
    licenceRef: LicenceHelper.generateLicenceRef(),
    startDate: new Date('2023-01-01')
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
