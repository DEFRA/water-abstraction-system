'use strict'

/**
 * @module ReviewChargeVersionsHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const ReviewChargeElementsReturnsModel = require('../../../app/models/review-charge-versions.model.js')

/**
 * Add a new review charge elements returns record for 2pt matching
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `reviewChargeElementId` - [random UUID]
 * - `reviewReturnId` - [random UUID]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReviewChargeVersionsModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReviewChargeElementsReturnsModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here in the database
 */
function defaults (data = {}) {
  const defaults = {
    reviewChargeElementId: generateUUID(),
    reviewReturnId: generateUUID()
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
