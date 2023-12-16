'use strict'

/**
 * @module CompanyHelper
 */

const CompanyModel = require('../../../app/models/company.model.js')
const { randomInteger } = require('./general.helper.js')

/**
 * Add a new company
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `name` - Example Trading Ltd
 * - `type` - organisation
 * - `companyNumber` - [randomly generated - 24296934]
 * - `organisationType` - limitedCompany
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:CompanyModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return CompanyModel.query()
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
    name: 'Example Trading Ltd',
    type: 'organisation',
    companyNumber: generateCompanyNumber(),
    organisationType: 'limitedCompany'
  }

  return {
    ...defaults,
    ...data
  }
}

function generateCompanyNumber () {
  return randomInteger(1000000, 9999999).toString()
}

module.exports = {
  add,
  defaults,
  generateCompanyNumber
}
