'use strict'

/**
 * @module CompanyContactHelper
 */

const CompanyContactModel = require('../../../app/models/company-contact.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new company contact
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `companyId` - [random UUID]
 * - `contactId` - [random UUID]
 * - `licenceRoleId` - [random UUID]
 * - `startDate` - 2022-04-01
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:CompanyContactModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return CompanyContactModel.query()
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
    companyId: generateUUID(),
    contactId: generateUUID(),
    licenceRoleId: generateUUID(),
    startDate: new Date('2022-04-01')
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
