'use strict'

/**
 * @module ReturnVersionHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const ReturnRequirementModel = require('../../../app/models/return-requirement.model.js')

/**
 * Add a new return requirement
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `return_version_id` - [random UUID]
 * - `returns_frequency` - [enum] - defult to approved
 * - `summer` - [boolean] - false
 * - `upload` - [boolean] - false
 * - `createdAt` - 2022-11-16 09:42:11.000
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnRequirementModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnRequirementModel.query()
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
    returnVersionId: generateUUID(),
    returnsFrequency: 'approved',
    summer: false,
    upload: false,
    // INFO: The lines table does not have a default for the date_created column. But it is set as
    // 'not nullable'! So, we need to ensure we set it when creating a new record, something we'll never actually need
    // to do because it's a static table. Also, we can't use Date.now() because Javascript returns the time since the
    // epoch in milliseconds, whereas a PostgreSQL timestamp field can only hold the seconds since the epoch. Pass it
    // an ISO string though ('2023-01-05T08:37:05.575Z') and PostgreSQL can do the conversion
    // https://stackoverflow.com/a/61912776/6117745
    createdAt: new Date('2022-11-16 09:42:11.000').toISOString()
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
