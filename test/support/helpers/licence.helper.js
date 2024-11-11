'use strict'

/**
 * @module LicenceHelper
 */

const LicenceModel = require('../../../app/models/licence.model.js')
const { randomInteger } = require('../general.js')
const RegionHelper = require('./region.helper.js')

/**
 * Add a new licence
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `waterUndertaker` - false
 * - `licenceRef` - [randomly generated - 01/12/34/1000]
 * - `regionId` - [randomly selected UUID from regions]
 * - `regions` - { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' }
 * - `startDate` - new Date('2022-01-01')
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceModel>} The instance of the newly created record
 */
async function add(data = {}) {
  const insertData = defaults(data)

  return LicenceModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new licence
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults(data = {}) {
  const { id: regionId } = RegionHelper.select()

  const defaults = {
    waterUndertaker: false,
    licenceRef: generateLicenceRef(),
    regionId,
    regions: { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' },
    startDate: new Date('2022-01-01')
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * Returns a randomly generated licence reference
 *
 * @returns {string} - A randomly generated licence reference
 */
function generateLicenceRef() {
  const secondPart = randomInteger(10, 99)
  const thirdPart = randomInteger(10, 99)
  const fourthPart = randomInteger(1000, 9999)

  return `01/${secondPart}/${thirdPart}/${fourthPart}`
}

module.exports = {
  add,
  defaults,
  generateLicenceRef
}
