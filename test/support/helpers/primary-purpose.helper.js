'use strict'

/**
 * @module PrimaryPurposeHelper
 */

const { selectRandomEntry } = require('../general.js')
const { data: primaryPurposes } = require('../../../db/seeds/data/primary-purposes.js')

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
    return primaryPurposes[index]
  }

  return selectRandomEntry(primaryPurposes)
}

module.exports = {
  data: primaryPurposes,
  select
}
