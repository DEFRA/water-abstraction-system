'use strict'

/**
 * @module PurposesUseHelper
 */

const PurposesUseModel = require('../../../../app/models/water/purposes-use.model.js')

/**
 * Add a new purposes use
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `legacyId` - 420
 * - `description` - Spray Irrigation - Storage
 * - `lossFactor` - high
 * - `isTwoPartTarrif` - true
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:PurposesUseModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return PurposesUseModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new purposes use
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    legacyId: '420',
    description: 'Spray Irrigation - Storage',
    lossFactor: 'high',
    isTwoPartTarrif: true
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
