'use strict'

/**
 * @module FinancialAgreementHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const FinancialAgreementModel = require('../../../app/models/financial-agreement.model.js')

/**
 * Add a new financial agreement
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `financialAgreementId` - [random UUID]
 * - `financialAgreementCode` - INST
 * - `description` - Installment
 * - `disabled` - false
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:FinancialAgreementModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return FinancialAgreementModel.query()
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
    financialAgreementCode: 'S127',
    description: 'Section 127 (Two Part Tariff)',
    disabled: false
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
