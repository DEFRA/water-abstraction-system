'use strict'

/**
 * @module ChargePurposeHelper
 */

const { db } = require('../../../db/db.js')

/**
 * Add a new charge purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `charge_element_id` - 090f42a0-7718-453e-bc6a-d57ef8d65417
 * - `abstraction_period_start_day` - 1
 * - `abstraction_period_start_month` - 4
 * - `abstraction_period_end_day` - 31
 * - `abstraction_period_end_month` - 3
 * - `authorised_annual_quantity` - 200
 * - `loss` - low
 * - `factors_overridden` - true
 * - `billable_annual_quantity` - 4.55
 * - `time_limited_start_date` - 2022-04-01
 * - `time_limited_end_date` - 2030-03-30
 * - `description` - Trickle Irrigation - Direct
 * - `purpose_primary_id` - 383ab43e-6d0b-4be0-b5d2-4226f333f1d7
 * - `purpose_secondary_id` - 0e92d79a-f17f-4364-955f-443360ebddb2
 * - `purpose_use_id` - cc9f412c-22c6-483a-93b0-b955a3a644dc
 * - `is_section_127_agreement_enabled` - true
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {string} The ID of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  const result = await db.table('water.charge_purposes')
    .insert(insertData)
    .returning('charge_purpose_id')

  return result
}

/**
 * Returns the defaults used when creating a new charge purpose
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    charge_element_id: '090f42a0-7718-453e-bc6a-d57ef8d65417',
    abstraction_period_start_day: 1,
    abstraction_period_start_month: 4,
    abstraction_period_end_day: 31,
    abstraction_period_end_month: 3,
    authorised_annual_quantity: 200,
    loss: 'low',
    factors_overridden: true,
    billable_annual_quantity: 4.55,
    time_limited_start_date: '2022-04-01',
    time_limited_end_date: '2030-03-30',
    description: 'Trickle Irrigation - Direct',
    purpose_primary_id: '383ab43e-6d0b-4be0-b5d2-4226f333f1d7',
    purpose_secondary_id: '0e92d79a-f17f-4364-955f-443360ebddb2',
    purpose_use_id: 'cc9f412c-22c6-483a-93b0-b955a3a644dc',
    is_section_127_agreement_enabled: true
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add
}
