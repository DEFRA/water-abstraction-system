'use strict'

/**
 * @module ModLogHelper
 */

const ModLogModel = require('../../../app/models/mod-log.model.js')
const { randomInteger } = require('../general.js')
const { generateLicenceRef } = require('./licence.helper.js')

/**
 * Add a new mod log
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `externalId` - [randomly generated - 9:99999]
 * - `eventCode` - DRFVER
 * - `eventDescription` - Draft version created
 * - `naldDate` - 2012-06-01
 * - `userId` - TTESTER
 * - `licenceRef` - [randomly generated - 01/12/34/1000]
 * - `licenceExternalId` - [randomly generated - 9:99999]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ModLogModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ModLogModel.query()
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
  const regionCode = randomInteger(1, 9)

  const defaults = {
    externalId: generateRegionNaldPatternExternalId(regionCode),
    eventCode: 'DRFVER',
    eventDescription: 'Draft version created',
    naldDate: new Date('2012-06-01'),
    userId: 'TTESTER',
    licenceRef: generateLicenceRef(),
    // The licence and mod log share the same external ID pattern: [region code:NALD ID]
    licenceExternalId: generateRegionNaldPatternExternalId(regionCode)
  }

  return {
    ...defaults,
    ...data
  }
}

function generateRegionNaldPatternExternalId (regionCode = null) {
  const regionCodeToUse = regionCode ?? randomInteger(1, 9)

  return `${regionCodeToUse}:${randomInteger(100, 99999)}`
}

module.exports = {
  add,
  defaults,
  generateRegionNaldPatternExternalId
}
