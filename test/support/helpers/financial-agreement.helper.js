'use strict'

/**
 * @module FinancialAgreementHelper
 */

const FinancialAgreementModel = require('../../../app/models/financial-agreement.model.js')
const { randomInteger } = require('../general.js')

/**
 * Add a new financial agreement
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `code` - [randomly generated - S127]
 * - `description` - [randomly generated - Section S127]
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
  const code = data.code ? data.code : generateFinancialAgreementCode()

  const defaults = {
    code,
    description: `Section ${code}`
  }

  return {
    ...defaults,
    ...data
  }
}

function generateFinancialAgreementCode () {
  return `S${randomInteger(100, 999)}`
}

module.exports = {
  add,
  defaults,
  generateFinancialAgreementCode
}
