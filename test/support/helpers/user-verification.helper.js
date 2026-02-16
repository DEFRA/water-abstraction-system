'use strict'

/**
 * @module UserVerificationHelper
 */

const { generateRandomInteger, generateUUID } = require('../../../app/lib/general.lib.js')
const UserVerificationModel = require('../../../app/models/user-verification.model.js')

const VERIFICATION_CODE_CHARACTERS = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXY'
const VERIFICATION_CODE_LENGTH = 5

/**
 * Add a new user verification
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `licenceEntityId` - [random UUID]
 * - `verificationCode` - [random verification code]
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
    verificationCode: generateVerificationCode(),
    verificationMethod: 'post',
    verifiedAt: null
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * Generates a random verification code
 *
 * @returns {string} a random 5-character verification code, using the allowed characters
 */
function generateVerificationCode() {
  return Array.from({ length: VERIFICATION_CODE_LENGTH }, () => {
    return VERIFICATION_CODE_CHARACTERS.charAt(generateRandomInteger(0, VERIFICATION_CODE_CHARACTERS.length - 1))
  }).join('')
}

module.exports = {
  add,
  defaults,
  generateVerificationCode
}
