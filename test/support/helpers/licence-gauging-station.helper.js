'use strict'

/**
 * @module LicenceGaugingStationHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceGaugingStationModel = require('../../../app/models/licence-gauging-station.model.js')

/**
 * Add a new licence-gauging-station entity
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licence_gauging_station_id` - [random UUID]
 * - `licence_id` - [random UUID]
 * - `licence_version_purpose_condition_id` - [random UUID]
 * - `source` - [string]
 * - `restriction_type` - [string]
 * - `threshold_unit` - [string]
 * - `threshold_value` - [string]
 * - `status` - [string]
 * - `alert_type` -[string]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceGaugingStationModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceGaugingStationModel.query()
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
    id: generateUUID(),
    licenceId: generateUUID(),
    licenceVersionPurposeConditionId: generateUUID(),
    source: 'wrls',
    restrictionType: 'flow',
    thresholdUnit: 'm3/s',
    thresholdValue: '100',
    status: 'resume',
    alertType: 'stop'
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
