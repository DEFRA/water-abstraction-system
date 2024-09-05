'use strict'

/**
 * @module LicenceEntityRoleHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceEntityRoleModel = require('../../../app/models/licence-entity-role.model.js')

/**
 * Add a new licence entity role
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `licenceEntityId` - [random UUID]
 * - `role` - primary_user
 * - `regimeEntityId` - [random UUID]
 * - `companyEntityId` - [random UUID]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceEntityRoleModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceEntityRoleModel.query()
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
    id: generateUUID(),
    licenceEntityId: generateUUID(),
    role: 'primary_user',
    regimeEntityId: generateUUID(),
    companyEntityId: generateUUID()
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
