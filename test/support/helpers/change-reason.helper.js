'use strict'

/**
 * @module ChangeReasonHelper
 */

const ChangeReasonModel = require('../../../app/models/change-reason.model.js')

/**
 * Add a new change reason
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `description` - Strategic review of charges (SRoC)
 * - `type` - new_chargeable_charge_version
 * - `enabledForNewChargeVersions` - true,
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
 * Returns the defaults used
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
    enabledForNewChargeVersions: true,
    // INFO: The change_reasons table does not have a default for the date_created column. But it is set as 'not
    // nullable'! So, we need to ensure we set it when creating a new record. Also, we can't use Date.now() because
    // Javascript returns the time since the epoch in milliseconds, whereas a PostgreSQL timestamp field can only hold
    // the seconds since the epoch. Pass it an ISO string though ('2022-02-23 09:19:39.953') and PostgreSQL can do the
    // conversion https://stackoverflow.com/a/61912776/6117745
    createdAt: new Date('2022-02-23 09:19:39.953').toISOString()
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
