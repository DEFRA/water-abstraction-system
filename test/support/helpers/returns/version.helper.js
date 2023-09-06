'use strict'

/**
 * @module VersionHelper
 */

const { randomUUID } = require('crypto')

const VersionModel = require('../../../../app/models/returns/version.model.js')

/**
 * Add a new version
 *
 * If no `data` is provided, default values will be used. These are
 *
 * `returnId` - v1:2:03/28/78/0033:10025289:2021-11-01:2022-10-31
 * `userId` - admin-internal@wrls.gov.uk
 * `userType` - internal
 * `versionNumber` - 1
 * `metadata` - {}
 * `createdAt` - 2022-11-16 09:42:11.000
 * `updatedAt` - null
 * `nilReturn` - false
 * `current` - true
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:VersionModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return VersionModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new line
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    versionId: randomUUID({ disableEntropyCache: true }),
    returnId: 'v1:2:03/28/78/0033:10025289:2021-11-01:2022-10-31',
    userId: 'admin-internal@wrls.gov.uk',
    userType: 'internal',
    versionNumber: 1,
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
