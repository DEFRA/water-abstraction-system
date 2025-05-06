'use strict'

/**
 * @module CompanyHelper
 */

const CompanyModel = require('../../../app/models/company.model.js')
const { generateRandomInteger } = require('../../../app/lib/general.lib.js')

/**
 * Add a new company
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `name` - Example Trading Ltd
 * - `type` - organisation
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:CompanyModel>} The instance of the newly created record
 */
function add(data = {}) {
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
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults(data = {}) {
  const defaults = {
    name: 'Example Trading Ltd',
    type: 'organisation'
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * Generate a company number
 *
 * @returns {int} - A random company number
 */
function generateCompanyNumber() {
  return generateRandomInteger(1000000, 9999999).toString()
}

/**
 * Generate a company external id
 *
 * This is built from NALD import data using the region code and party id
 *
 * @returns {string} - A random external id
 */
function generateExternalId() {
  const regionCode = generateRandomInteger(1, 9)
  const partyId = generateRandomInteger(100, 9999998)

  return `${regionCode}:${partyId}`
}

module.exports = {
  add,
  defaults,
  generateCompanyNumber,
  generateExternalId
}
