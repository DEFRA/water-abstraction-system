'use strict'

/**
 * @module LicenceHelper
 */

const { randomInteger } = require('../general.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceModel = require('../../../../app/models/water/licence.model.js')

/**
 * Add a new licence
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - [randomly generated - 01/123]
 * - `regionId` - [random UUID]
 * - `regions` - { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' }
 * - `startDate` - new Date('2022-01-01')
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:LicenceModel} The instance of the newly created record
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
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
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
  const secondPart = randomInteger(100, 999)

  return `01/${secondPart}`
}

module.exports = {
  add,
  defaults,
  generateLicenceRef
}
