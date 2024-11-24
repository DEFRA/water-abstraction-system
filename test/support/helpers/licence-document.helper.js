'use strict'

/**
 * @module LicenceDocumentHelper
 */

const { generateLicenceRef } = require('./licence.helper.js')
const LicenceDocumentModel = require('../../../app/models/licence-document.model.js')

/**
 * Add a new licence document
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - [randomly generated - 01/123]
 * - `startDate` - new Date('2022-01-01')
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceDocumentModel>} The instance of the newly created record
 */
async function add(data = {}) {
  const insertData = defaults(data)

  return LicenceDocumentModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new licence
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
    licenceRef: generateLicenceRef(),
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
