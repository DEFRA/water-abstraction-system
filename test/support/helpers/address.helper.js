'use strict'

/**
 * @module AddressHelper
 */

const AddressModel = require('../../../app/models/address.model.js')
const { randomInteger } = require('../general.js')

/**
 * Add a new address
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `address1` - ENVIRONMENT AGENCY
 * - `address2` - HORIZON HOUSE
 * - `address3` - DEANERY ROAD
 * - `town` - BRISTOL
 * - `postcode` - BS1 5AH
 * - `country` - United Kingdom
 * - `dataSource` - wrls
 * - `uprn` - [randomly generated - 340116]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:AddressModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return AddressModel.query()
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
    address1: 'ENVIRONMENT AGENCY',
    address2: 'HORIZON HOUSE',
    address3: 'DEANERY ROAD',
    address4: 'BRISTOL',
    postcode: 'BS1 5AH',
    country: 'United Kingdom',
    dataSource: 'wrls',
    uprn: generateUprn()
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * Generate an UPRN for an address
 *
 * @returns {string} - A random UPRN
 */
function generateUprn () {
  return randomInteger(100, 999999)
}

/**
 * Generate an address external id
 *
 * This is built from NALD import data using the region code and address id
 *
 * @returns {string} - A random external id
 */
function generateExternalId () {
  const regionCode = randomInteger(1, 9)
  const addressId = randomInteger(100, 99998)

  return `${regionCode}:${addressId}`
}

module.exports = {
  add,
  defaults,
  generateUprn,
  generateExternalId
}
