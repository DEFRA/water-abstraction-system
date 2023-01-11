'use strict'

/**
 * @module BillingChargeCategoryHelper
 */

const BillingChargeCategoryModel = require('../../../../app/models/water/billing-charge-category.model.js')

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
 * - `maxVolume` - 5000,
 * - `dateCreated` - Date.now()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingChargeCategoryModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillingChargeCategoryModel.query()
    .insert({ ...insertData })
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
    maxVolume: 5000,
    // INFO: The billing_charge_categories table does not have a default for the date_created column. But it is set as
    // 'not nullable'! So, we need to ensure we set it when creating a new record, something we'll never actually need
    // to do because it's a static table. Also, we can't use Date.now() because Javascript returns the time since the
    // epoch in milliseconds, whereas a PostgreSQL timestamp field can only hold the seconds since the epoch. Pass it
    // an ISO string though ('2023-01-05T08:37:05.575Z') and PostgreSQL can do the conversion
    // https://stackoverflow.com/a/61912776/6117745
    createdAt: new Date().toISOString()
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
