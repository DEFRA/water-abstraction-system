'use strict'

/**
 * @module PurposeHelper
 */

const PurposeModel = require('../../../../app/models/water/purpose.model.js')

/**
 * Add a new purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `legacyId` - 420
 * - `description` - Spray Irrigation - Storage
 * - `lossFactor` - high
 * - `isTwoPartTariff` - true
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:PurposeModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return PurposeModel.query()
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
    legacyId: '420',
    description: 'Spray Irrigation - Storage',
    lossFactor: 'high',
    isTwoPartTariff: true
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
