'use strict'

/**
 * @module ChargeReferenceHelper
 */

const ChargeReferenceModel = require('../../../../app/models/water/charge-reference.model.js')

/**
 * Add a new charge reference
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeVersionId` - b033e8d1-3ad4-4782-930b-c1e10cb9110e
 * - `source` - non-tidal
 * - `loss` - low
 * - `description` - Mineral washing
 * - `isSection127AgreementEnabled` - true
 * - `scheme` - sroc
 * - `isRestrictedSource` - true
 * - `waterModel` - no model
 * - `volume` - 6.819
 * - `billingChargeCategoryId` - cd9ca44d-2ddb-4d5d-ac62-79883176bdec
 * - `additionalCharges` - { isSupplyPublicWater: true }
 * - `adjustments` - { s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: 0.562114443 }
 * - `eiucRegion` - Anglian
 * - `abstractionPeriodStartDay` - 1
 * - `abstractionPeriodStartMonth` - 1
 * - `abstractionPeriodEndDay` - 31
 * - `abstractionPeriodEndMonth` - 12
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ChargeReferenceModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ChargeReferenceModel.query()
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
    chargeVersionId: 'b033e8d1-3ad4-4782-930b-c1e10cb9110e',
    source: 'non-tidal',
    loss: 'low',
    description: 'Mineral washing',
    isSection127AgreementEnabled: true,
    scheme: 'sroc',
    isRestrictedSource: true,
    waterModel: 'no model',
    volume: 6.819,
    billingChargeCategoryId: 'cd9ca44d-2ddb-4d5d-ac62-79883176bdec',
    additionalCharges: { isSupplyPublicWater: true },
    adjustments: { s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: '0.562114443' },
    eiucRegion: 'Anglian',
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 1,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 12
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
