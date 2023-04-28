'use strict'

/**
 * @module LicenceHelper
 */

const LicenceModel = require('../../../../app/models/water/licence.model.js')

/**
 * Add a new licence
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - 01/123
 * - `regionId` - bd114474-790f-4470-8ba4-7b0cc9c225d7
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
    licenceRef: '01/123',
    regionId: 'bd114474-790f-4470-8ba4-7b0cc9c225d7',
    regions: { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' },
    startDate: new Date('2022-01-01')
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
