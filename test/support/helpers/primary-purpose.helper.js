'use strict'

/**
 * @module PrimaryPurposeHelper
 */

const { selectRandomEntry } = require('../general.js')
const PrimaryPurposes = require('../../../db/seeds/data/primary-purposes.js')

const DEFAULT_INDEX = 0

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = select(DEFAULT_INDEX)

  return {
    ...defaults,
    ...data
  }
}

/**
 * Select an entry from the reference data entries seeded at the start of testing
 *
 * Because this helper is linked to a reference record instead of a transaction, we don't expect these to be created
 * when using the service.
 *
 * So, they are seeded automatically when tests are run. Tests that need to link to a record can use this method to
 * select a specific entry, or have it it return one at random.
 *
 * @param {Number} [index=-1] - The reference entry to select. Defaults to -1 which means an entry will be returned at
 * random from the reference data
 *
 * @returns {Object} The selected reference entry or one picked at random
 */
function select (index = -1) {
  if (index > -1) {
    return PrimaryPurposes.data[index]
  }

  return selectRandomEntry(PrimaryPurposes.data)
}

module.exports = {
  data: PrimaryPurposes.data,
  DEFAULT_INDEX,
  defaults,
  select
}
