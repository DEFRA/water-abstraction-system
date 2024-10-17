'use strict'

/**
 * @module MonitoringStationHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const MonitoringStationModel = require('../../../app/models/monitoring-station.model.js')
const { timestampForPostgres } = require('../../../app/lib/general.lib.js')

/**
 * Add a new monitoring-station entity
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `hydrologyStationId` - [random UUID]
 * - `lat` - 52.04436
 * - `long` - -0.15477
 * - `gridReference` - TL2664640047
 * - `label` - MEVAGISSEY FIRE STATION
 * - `createdAt` - new Date()
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:MonitoringStationModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return MonitoringStationModel.query()
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
    hydrologyStationId: generateUUID(),
    lat: 52.04436,
    long: -0.15477,
    gridReference: 'TL2664640047',
    label: 'MEVAGISSEY FIRE STATION',
    createdAt: timestamp
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
