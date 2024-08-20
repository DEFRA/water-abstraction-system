'use strict'

/**
 * @module LicenceHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const { randomInteger } = require('../general.js')

/**
 * Add a new licence
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `waterUndertaker` - false
 * - `licenceRef` - [randomly generated - 01/12/34/1000]
 * - `regionId` - [random UUID]
 * - `regions` - { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' }
 * - `startDate` - new Date('2022-01-01')
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceModel>} The instance of the newly created record
 */
async function add (data = {}) {
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
 */
function defaults (data = {}) {
  const defaults = {
    waterUndertaker: false,
    licenceRef: generateLicenceRef(),
    regionId: generateUUID(),
    regions: { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' },
    startDate: new Date('2022-01-01')
  }

  return {
    ...defaults,
    ...data
  }
}

function generateLicenceRef () {
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
