'use strict'

/**
 * @module PermitLicenceHelper
 */

const PermitLicenceModel = require('../../../app/models/permit-licence.model.js')
const { generateLicenceRef } = require('./licence.helper.js')

/**
 * Add a new licence into the licence table in the permit schema
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceStatusId` - [int]
 * - `licenceTypeId` - [int]
 * - `licenceRegimeId` - [int]
 * - `licenceSearchKey` - [null]
 * - `isPublicDomain` - [null]
 * - `licenceStartDt` - [null]
 * - `licenceEndDt` - [null]
 * - `licenceRef` - [randomly generated - 01/123]
 * - `licenceDataValue` - [null]
 * - `licenceSummary` - [null]
 * - `metadata` - [null]
 * - `dateLicenceVersionPurposeConditionsLastCopied` - [null]
 * - `dateGaugingStationLinksLastCopied` - [null]
 * - `dateCreated` - new Date()
 * - `dateUpdated` - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:PermitLicenceModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return PermitLicenceModel.query()
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
    licenceStatusId: 1,
    licenceTypeId: 8,
    licenceRef: generateLicenceRef(),
    licenceRegimeId: 1
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
