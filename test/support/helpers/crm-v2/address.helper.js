'use strict'

/**
 * @module AddressHelper
 */

const AddressModel = require('../../../../app/models/crm-v2/address.model.js')
const { randomInteger } = require('../general.helper.js')

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
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
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
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    address1: 'ENVIRONMENT AGENCY',
    address2: 'HORIZON HOUSE',
    address3: 'DEANERY ROAD',
    town: 'BRISTOL',
    postcode: 'BS1 5AH',
    country: 'United Kingdom',
    dataSource: 'wrls',
    uprn: randomInteger(100, 999999)
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
