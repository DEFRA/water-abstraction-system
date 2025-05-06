'use strict'

/**
 * @module RegionHelper
 */

const { generateRandomInteger } = require('../../../app/lib/general.lib.js')
const { data: regions } = require('../../../db/seeds/data/regions.js')

// The `BILL_RUN_REGION_INDEX` is only to be used for testing bill run services that need to know details of bill runs
// per region. This region is not selected randomly to prevent unit tests from using this region unless necessary.
const BILL_RUN_REGION_INDEX = 9
const TEST_REGION_INDEX = 8

/**
 * Select an entry from the reference data entries seeded at the start of testing
 *
 * Because this helper is linked to a reference record instead of a transaction, we don't expect these to be created
 * when using the service.
 *
 * So, they are seeded automatically when tests are run. Tests that need to link to a record can use this method to
 * select a specific entry, or have it return one at random.
 *
 * @param {number} [index=-1] - The reference entry to select. Defaults to -1 which means an entry will be returned at
 * random from the reference data
 *
 * @returns {object} The selected reference entry or one picked at random
 */
function select(index = -1) {
  if (index > -1) {
    return regions[index]
  }

  // 2 is deducted from the length of the array so that the Test Bill Run Region is not selected randomly
  const randomIndex = generateRandomInteger(0, regions.length - 2)

  return regions[randomIndex]
}

module.exports = {
  data: regions,
  select,
  BILL_RUN_REGION_INDEX,
  TEST_REGION_INDEX
}
