'use strict'

/**
 * @module LicenceDocumentRoleHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceDocumentRoleModel = require('../../../app/models/licence-document-role.model.js')

/**
 * Add a new licence document role
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceDocumentId` - [random UUID]
 * - `companyId` - [random UUID]
 * - `addressId` - [random UUID]
 * - `licenceRoleId` - [random UUID]
 * - `startDate` - new Date('2022-01-01')
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceDocumentRoleModel>} The instance of the newly created record
 */
async function add(data = {}) {
  const insertData = defaults(data)

  return LicenceDocumentRoleModel.query()
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
    licenceDocumentId: generateUUID(),
    companyId: generateUUID(),
    addressId: generateUUID(),
    licenceRoleId: generateUUID(),
    startDate: new Date('2022-01-01')
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
