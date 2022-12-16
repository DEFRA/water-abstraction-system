'use strict'

/**
 * @module BillingChargeCategoryHelper
 */

const { db } = require('../../../db/db.js')

/**
 * Add a new billing charge category
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `reference` - 4.4.5
 * - `subsistence_charge` - 12000
 * - `description` - Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where a Tier 1 model applies.
 * - `short_description` - Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model
 * - `is_tidal` - false
 * - `loss_factor` - low
 * - `model_tier` - tier 1
 * - `is_restricted_source` - true
 * - `min_volume` - 0
 * - `max_volume` - 5000
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {string} The ID of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  const result = await db.table('water.billing_charge_categories')
    .insert(insertData)
    .returning('billing_charge_category_id')

  return result
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
    subsistence_charge: 12000,
    description: 'Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where a Tier 1 model applies.',
    short_description: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
    is_tidal: false,
    loss_factor: 'low',
    model_tier: 'tier 1',
    is_restricted_source: true,
    min_volume: 0,
    max_volume: 5000
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add
}
