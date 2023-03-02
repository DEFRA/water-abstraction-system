'use strict'

/**
 * @module ChangeReasonHelper
 */

const ChangeReasonModel = require('../../../../app/models/water/change-reason.model.js')

/**
 * Add a new change reason
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `description` - Strategic review of charges (SRoC)
 * - `type` - new_chargeable_charge_version
 * - `isEnabledForNewChargeVersions` - true,
 * - `createdAt` - 2022-02-23
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ChangeReasonModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ChangeReasonModel.query()
    .insert({ ...insertData })
    .returning('*')
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
    description: 'Strategic review of charges (SRoC)',
    type: 'new_chargeable_charge_version',
    isEnabledForNewChargeVersions: true,
    createdAt: new Date('2022-02-23')
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
