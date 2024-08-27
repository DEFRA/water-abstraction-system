'use strict'

/**
 * @module ReviewChargeElementHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const ReviewChargeElementModel = require('../../../app/models/review-charge-element.model.js')

/**
 * Add a new review charge element for 2pt matching
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeElementId` - [random UUID]
 * - `reviewChargeReferenceId` - [random UUID]
 * - `allocated` - 0
 * - `chargeDatesOverlap` - false
 * - `issues` - null
 * - `status` - ready
 * - `amendedAllocated` - 0
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReviewChargeElementModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReviewChargeElementModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here in the database
 *
 * @returns {object} - Returns data from the query
 */
function defaults (data = {}) {
  const defaults = {
    chargeElementId: generateUUID(),
    reviewChargeReferenceId: generateUUID(),
    allocated: 0,
    chargeDatesOverlap: false,
    issues: null,
    status: 'ready',
    amendedAllocated: 0
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
