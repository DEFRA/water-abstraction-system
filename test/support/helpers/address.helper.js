'use strict'

/**
 * @module AddressHelper
 */

const crypto = require('crypto')

const AddressModel = require('../../../app/models/address.model.js')
const { generateRandomInteger } = require('../../../app/lib/general.lib.js')

/**
 * Add a new address
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `address1` - ENVIRONMENT AGENCY
 * - `address2` - HORIZON HOUSE
 * - `address3` - DEANERY ROAD
 * - `address4` - BRISTOL
 * - `postcode` - BS1 5AH
 * - `country` - United Kingdom
 * - `dataSource` - wrls
 * - `uprn` - [randomly generated - 340116]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:AddressModel} The instance of the newly created record
 */
function add(data = {}) {
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
function defaults(data = {}) {
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
 * This function creates an MD5 hash of a saved address.
 *
 * @param {object} session
 *
 * @returns {Promise<string>} - The md5 hash string of the address
 */
function generateAdreessMD5Hash(session) {
  const name = session.contactName
  const addressLine1 = session.address.addressLine1
  const addressLine2 = session.address.addressLine2 ?? ''
  const addressLine3 = session.address.addressLine3 ?? ''
  const addressLine4 = session.address.addressLine4
  const postcode = session.address.postcode ?? ''
  const country = session.address.country ?? ''

  const _combinedString = `${name}${addressLine1}${addressLine2}${addressLine3}${addressLine4}${postcode}${country}`

  return crypto.createHash('md5').update(_combinedString).digest('hex')
}

/**
 * Generate an UPRN for an address
 *
 * @returns {string} - A random UPRN
 */
function generateUprn() {
  return generateRandomInteger(100, 999999)
}

/**
 * Generate an address external id
 *
 * This is built from NALD import data using the region code and address id
 *
 * @returns {string} - A random external id
 */
function generateExternalId() {
  const regionCode = generateRandomInteger(1, 9)
  const addressId = generateRandomInteger(100, 99998)

  return `${regionCode}:${addressId}`
}

module.exports = {
  add,
  defaults,
  generateAdreessMD5Hash,
  generateUprn,
  generateExternalId
}
