'use strict'

/**
 * @module ReturnRequirementPointHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const ReturnRequirementPointModel = require('../../../app/models/return-requirement-point.model.js')

/**
 * Add a new return requirement point
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `return_requirement_id` - [random UUID]
 * - `description` - 'Point description'
 * - `ngr_1` - 'TL 800 234'
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnRequirementPointModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnRequirementPointModel.query()
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
  const defaults = {
    id: generateUUID(),
    returnRequirementId: generateUUID(),
    description: 'A description of the point',
    ngr1: 'TL 800 234'
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
