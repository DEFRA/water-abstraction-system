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
 * - `gaugingStationId` - [random UUID]
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
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults (data = {}) {
  const defaults = {
    gaugingStationId: generateUUID(),
    licenceId: generateUUID(),
    restrictionType: 'flow',
    source: 'wrls',
    thresholdUnit: 'm3/s',
    thresholdValue: 100,
    // INFO: The table does not have a default for the createAt and updatedAt columns. But they are set as 'not
    // nullable'! So, we need to ensure we set them when creating a new record. Also, we can't use Date.now() because
    // Javascript returns the time since the epoch in milliseconds, whereas a PostgreSQL timestamp field can only hold
    // the seconds since the epoch. Pass it an ISO string though ('2023-01-05T08:37:05.575Z') and PostgreSQL can do the
    // conversion https://stackoverflow.com/a/61912776/6117745
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
