'use strict'

/**
 * @module LicenceVersionHolderHelper
 */

const LicenceVersionHolderModel = require('../../../app/models/licence-version-holder.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new licence version holder
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceVersionId` - [random UUID]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:LicenceVersionHolderModel} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return LicenceVersionHolderModel.query()
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
    licenceVersionId: generateUUID()
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
