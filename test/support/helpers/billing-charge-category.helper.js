'use strict'

/**
 * @module BillingChargeCategoryHelper
 */

const BillingChargeCategoryModel = require('../../../app/models/billing-charge-category.model.js')

/**
 * Add a new billing charge category
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `reference` - 4.4.5
 * - `subsistenceCharge` - 12000
 * - `description` - Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where a Tier 1 model applies.
 * - `shortDescription` - Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model
 * - `isTidal` - false
 * - `lossFactor` - low
 * - `modelTier` - tier 1
 * - `isRestrictedSource` - true
 * - `minVolume` - 0
 * - `maxVolume` - 5000
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingChargeCategoryModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillingChargeCategoryModel.query()
    .insertData({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new billing charge category
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    reference: '4.4.5',
    subsistenceCharge: 12000,
    description: 'Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
    isTidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    isRestrictedSource: true,
    minVolume: 0,
    maxVolume: 5000
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
