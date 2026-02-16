'use strict'

/**
 * @module UserVerificationDocumentHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const UserVerificationDocumentModel = require('../../../app/models/user-verification-document.model.js')

/**
 * Add a new user verification document
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `userVerificationId` - [random UUID]
 * - `licenceDocumentHeaderId` - [random UUID]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:UserVerificationDocumentModel>} The instance of the newly created record
 */
async function add(data = {}) {
  const insertData = defaults(data)

  return UserVerificationDocumentModel.query()
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
    licenceDocumentHeaderId: generateUUID(),
    userVerificationId: generateUUID()
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
