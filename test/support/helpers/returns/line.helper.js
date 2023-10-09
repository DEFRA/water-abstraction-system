'use strict'

/**
 * @module LineHelper
 */

const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LineModel = require('../../../../app/models/returns/line.model.js')

/**
 * Add a new line
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `versionId` - [random UUID]
 * - `substance` - water
 * - `quantity` - 4380
 * - `unit` - m³
 * - `startDate` - 2021-12-26
 * - `endDate` - 2022-01-01
 * - `timePeriod` - week
 * - `metadata` - {}
 * - `createdAt` - 2022-11-16 09:42:11.000
 * - `updatedAt` - null
 * - `readingType` - measured
 * - `userUnit` - m³
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:LineModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return LineModel.query()
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
    lineId: generateUUID(),
    versionId: generateUUID(),
    substance: 'water',
    quantity: 4380,
    unit: 'm³',
    startDate: new Date('2021-12-26'),
    endDate: new Date('2022-01-01'),
    timePeriod: 'week',
    metadata: {},
    // INFO: The lines table does not have a default for the date_created column. But it is set as
    // 'not nullable'! So, we need to ensure we set it when creating a new record, something we'll never actually need
    // to do because it's a static table. Also, we can't use Date.now() because Javascript returns the time since the
    // epoch in milliseconds, whereas a PostgreSQL timestamp field can only hold the seconds since the epoch. Pass it
    // an ISO string though ('2023-01-05T08:37:05.575Z') and PostgreSQL can do the conversion
    // https://stackoverflow.com/a/61912776/6117745
    createdAt: new Date('2022-11-16 09:42:11.000').toISOString(),
    updatedAt: null,
    readingType: 'measured',
    userUnit: 'm³'
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
