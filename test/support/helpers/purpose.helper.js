'use strict'

/**
 * @module PurposeHelper
 */

const PurposeModel = require('../../../app/models/purpose.model.js')
const { randomInteger } = require('./general.helper.js')

/**
 * Add a new purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `legacyId` - [randomly generated - 420]
 * - `description` - Spray Irrigation - Storage
 * - `lossFactor` - high
 * - `twoPartTariff` - true
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:PurposeModel>} The instance of the newly created record
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
    legacyId: generateLegacyId(),
    description: 'Spray Irrigation - Storage',
    lossFactor: 'high',
    twoPartTariff: true
  }

  return {
    ...defaults,
    ...data
  }
}

function generateLegacyId () {
  const numbering = randomInteger(10, 99)

  return `${numbering}0`
}

module.exports = {
  add,
  defaults
}
