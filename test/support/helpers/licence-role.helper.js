'use strict'

/**
 * @module LicenceRoleHelper
 */

const LicenceRoleModel = require('../../../app/models/licence-role.model.js')

/**
 * Add a new licence role
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `name` - licenceHolder
 * - `label` - Licence Holder
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceRoleModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceRoleModel.query()
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
    name: 'licenceHolder',
    label: 'Licence Holder'
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
