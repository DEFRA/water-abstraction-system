'use strict'

/**
 * @module ReturnSubmissionLineHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const ReturnSubmissionLineModel = require('../../../app/models/return-submission-line.model.js')

/**
 * Add a new return submission line
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `returnSubmissionId` - [random UUID]
 * - `quantity` - 4380
 * - `startDate` - 2021-12-26
 * - `endDate` - 2022-01-01
 * - `timePeriod` - week
 * - `createdAt` - 2022-11-16 09:42:11.000
 * - `updatedAt` - null
 * - `readingType` - measured
 * - `userUnit` - m³
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnSubmissionLineModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnSubmissionLineModel.query()
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
    id: generateUUID(),
    returnSubmissionId: generateUUID(),
    quantity: 4380,
    startDate: new Date('2021-12-26'),
    endDate: new Date('2022-01-01'),
    timePeriod: 'week',
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
