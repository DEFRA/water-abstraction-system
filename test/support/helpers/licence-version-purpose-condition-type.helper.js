'use strict'

/**
 * @module LicenceVersionPurposeConditionTypeHelper
 */

const { timestampForPostgres } = require('../../../app/lib/general.lib.js')
const LicenceVersionPurposeConditionTypeModel = require('../../../app/models/licence-version-purpose-condition-type.model.js')

/**
 * Add a new licence version purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `code` - COMB
 * - `subcode` - LINK
 * - `description` - Condition To Indicate Licence  Split On Nald
 * - `subcodeDescription` - Link Between Split Licences
 * - `displayTitle` - Link between split licences
 * - `createdAt` - new Date()
 * - `updatedAt` - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposeConditionTypeModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceVersionPurposeConditionTypeModel.query()
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
  const timestamp = timestampForPostgres()

  const defaults = {
    code: 'COMB',
    subcode: 'LINK',
    description: 'Condition To Indicate Licence  Split On Nald',
    subcodeDescription: 'Link Between Split Licences',
    displayTitle: 'Link between split licences',
    createdAt: timestamp,
    updatedAt: timestamp
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
