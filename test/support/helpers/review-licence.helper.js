'use strict'

/**
 * @module ReviewLicenceHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('./licence.helper.js')
const ReviewLicenceModel = require('../../../app/models/review-licence.model.js')

/**
 * Add a new review licence record for 2pt matching
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `billRunId` - [random UUID]
 * - `licenceId` - [random UUID]
 * - `licenceRef` - [randomly generated - 01/123]
 * - `licenceHolder` - Licence Holder Ltd
 * - `progress` - false
 * - `status` - ready
 * - `issues` - ''
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReviewLicenceModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReviewLicenceModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here in the database
 *
 * @returns {object} - Returns data from the query
 */
function defaults (data = {}) {
  const defaults = {
    billRunId: generateUUID(),
    licenceId: generateUUID(),
    licenceRef: generateLicenceRef(),
    licenceHolder: 'Licence Holder Ltd',
    progress: false,
    status: 'ready',
    issues: ''
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
