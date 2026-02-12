'use strict'

/**
 * @module UserVerificationHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const UserVerificationModel = require('../../../app/models/user-verification.model.js')

/**
 * Add a new user verification
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `licenceEntityId` - [random UUID]
 * - `verificationCode` - 123Abc
 * - `verificationMethod` - post (all verification is done by post)
 * - `companyEntityId` - [random UUID]
 * - `verifiedAt` - null (indicates not yet verified)
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:UserVerificationModel>} The instance of the newly created record
 */
async function add(data = {}) {
  const insertData = defaults(data)

  return UserVerificationModel.query()
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
    companyEntityId: generateUUID(),
    createdAt: new Date(),
    id: generateUUID(),
    licenceEntityId: generateUUID(),
    verificationCode: '123Abc',
    verificationMethod: 'post',
    verifiedAt: null
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
