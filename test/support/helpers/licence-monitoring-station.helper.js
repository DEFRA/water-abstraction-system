'use strict'

/**
 * @module LicenceMonitoringStationHelper
 */

const { generateUUID, timestampForPostgres } = require('../../../app/lib/general.lib.js')
const LicenceMonitoringStationModel = require('../../../app/models/licence-monitoring-station.model.js')

/**
 * Add a new licence-monitoring-station entity
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `monitoringStationId` - [random UUID]
 * - `licenceId` - [random UUID]
 * - `restrictionType` - flow
 * - `source` - wrls
 * - `thresholdUnit` - m3/s
 * - `thresholdValue` - 100
 * - `createdAt` - Date.now()
 * - `updatedAt` - Date.now()
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceMonitoringStationModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceMonitoringStationModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults (data = {}) {
  const timestamp = timestampForPostgres()

  const defaults = {
    monitoringStationId: generateUUID(),
    licenceId: generateUUID(),
    restrictionType: 'flow',
    source: 'wrls',
    thresholdUnit: 'm3/s',
    thresholdValue: 100,
    createdAt: timestamp,
    updatedAt: timestamp
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
