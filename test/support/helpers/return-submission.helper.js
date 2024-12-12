'use strict'

/**
 * @module ReturnSubmissionHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateReturnLogId } = require('./return-log.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')

/**
 * Add a new return submission
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `returnLogId` - [randomly generated - v1:1:03/28/78/0033:10025289:2022-04-01:2023-03-31]
 * - `userId` - admin-internal@wrls.gov.uk
 * - `userType` - internal
 * - `version` - 1
 * - `metadata` - {}
 * - `createdAt` - 2022-11-16 09:42:11.000
 * - `updatedAt` - null
 * - `nilReturn` - false
 * - `current` - true
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnSubmissionModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return ReturnSubmissionModel.query()
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
function defaults(data = {}) {
  const defaults = {
    id: generateUUID(),
    returnLogId: generateReturnLogId(),
    userId: 'admin-internal@wrls.gov.uk',
    userType: 'internal',
    version: 1,
    metadata: {},
    // INFO: The lines table does not have a default for the date_created column. But it is set as
    // 'not nullable'! So, we need to ensure we set it when creating a new record, something we'll never actually need
    // to do because it's a static table. Also, we can't use Date.now() because Javascript returns the time since the
    // epoch in milliseconds, whereas a PostgreSQL timestamp field can only hold the seconds since the epoch. Pass it
    // an ISO string though ('2023-01-05T08:37:05.575Z') and PostgreSQL can do the conversion
    // https://stackoverflow.com/a/61912776/6117745
    createdAt: new Date('2022-11-16 09:42:11.000').toISOString(),
    updatedAt: null,
    nilReturn: false,
    current: true
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
