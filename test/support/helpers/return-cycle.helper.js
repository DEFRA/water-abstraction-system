'use strict'

/**
 * @module ReturnCycleHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { timestampForPostgres } = require('../../../app/lib/general.lib.js')
const ReturnCycleModel = require('../../../app/models/return-cycle.model.js')

/**
 * Add a new return cycle
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - UUID
 * - `dueDate` - 2023-04-28
 * - `startDate` - 2023-04-28
 * - `endDate` - 2023-03-31
 * - `isSummer` - false
 * - `isSubmittedInWrls` - false
 * - `createdAt` - new Date()
 * - `updatedAt` - new Date()
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnLogModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnCycleModel.query()
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
    id: generateUUID(),
    createdAt: timestamp,
    dueDate: new Date('2023-04-28'),
    endDate: new Date('2023-03-31'),
    isSubmittedInWrls: false,
    isSummer: false,
    startDate: new Date('2022-04-01'),
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
