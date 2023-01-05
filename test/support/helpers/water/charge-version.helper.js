'use strict'

/**
 * @module ChargeVersionHelper
 */

const ChargeVersionModel = require('../../../../app/models/water/charge-version.model.js')
const LicenceHelper = require('./licence.helper.js')

/**
 * Add a new charge version
 *
 * A charge version is always linked to a licence. So, creating a charge version will automatically create a new
 * licence and handle linking the two together by `licence_id`.
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - 01/123
 * - `scheme` - sroc
 * - `startDate` - 2022-04-01
 *
 * See `LicenceHelper` for the licence defaults
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 * @param {Object} [licence] Any licence data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ChargeVersionModel} The instance of the newly created record
 */
async function add (data = {}, licence = {}) {
  const licenceId = await _licenceId(licence)

  const insertData = defaults({ ...data, licenceId })

  return ChargeVersionModel.query()
    .insert({ ...insertData })
    .returning('*')
}

async function _licenceId (providedLicence) {
  if (providedLicence?.licenceId) {
    return providedLicence.licenceId
  }

  const licence = await LicenceHelper.add(providedLicence)

  return licence.licenceId
}

/**
 * Returns the defaults used when creating a new charge version
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    licenceRef: '01/123',
    scheme: 'sroc',
    startDate: new Date('2022-04-01')
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
