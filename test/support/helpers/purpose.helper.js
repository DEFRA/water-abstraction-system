'use strict'

/**
 * @module PurposeHelper
 */

const { randomInteger, selectRandomEntry } = require('../general.js')
const Purposes = require('../../../db/seeds/data/purposes.js')

const DEFAULT_INDEX = 39

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
    return Purposes.data[index]
  }

  return selectRandomEntry(Purposes.data)
}

function generatePurposeCode () {
  const numbering = randomInteger(1, 999)

  return `${numbering}0`
}

module.exports = {
  DEFAULT_INDEX,
  data: Purposes.data,
  defaults,
  generatePurposeCode,
  select
}
