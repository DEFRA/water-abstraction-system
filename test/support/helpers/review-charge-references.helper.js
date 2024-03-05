'use strict'

/**
 * @module ReviewChargeReferencesHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const ReviewChargeReferencesModel = require('../../../app/models/review-charge-versions.model.js')

/**
 * Add a new review charge version record for 2pt matching
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `reviewChargeVersionId` - [random UUID]
 * - `chargeReferenceId` - [random UUID]
 * - `aggregate` - Strategic review of charges (SRoC)
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReviewChargeReferencesModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReviewChargeReferencesModel.query()
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
    reviewChargeVersionId: generateUUID(),
    chargeReference: generateUUID(),
    aggregate: 1
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
