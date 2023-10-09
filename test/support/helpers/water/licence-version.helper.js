'use strict'

/**
 * @module LicenceVersionHelper
 */

const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceVersionModel = require('../../../../app/models/water/licence-version.model.js')

/**
 * Add a new licence version
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceId` - [random UUID]
 * - `issue` - 1
 * - `increment` - 0
 * - `status` - 'current'
 * - `startDate` - new Date('2022-01-01')
 * - `externalId` - '9:99999:1:0'
 * - `createdAt` - new Date()
 * - `updatedAt` - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:LicenceVersionModel} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceVersionModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new licence version
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    licenceId: generateUUID(),
    issue: 1,
    increment: 0,
    status: 'current',
    startDate: new Date('2022-01-01'),
    externalId: '9:99999:1:0',
    createdAt: new Date(),
    updatedAt: new Date()
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
