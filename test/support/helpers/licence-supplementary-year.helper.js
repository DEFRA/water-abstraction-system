'use strict'

/**
 * @module LicenceSupplementaryYearHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceSupplementaryYearModel = require('../../../app/models/licence-supplementary-year.model.js')

/**
 * Add a new licence supplementary year record
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceId` - [random UUID]
 * - `financialYearEnd` - 2023
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceSupplementaryYearModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return LicenceSupplementaryYearModel.query()
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
function defaults(data = {}) {
  const defaults = {
    licenceId: generateUUID(),
    financialYearEnd: 2023
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
