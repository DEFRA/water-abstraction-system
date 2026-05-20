'use strict'

/**
 * Checks whether a licence exists for the given licence reference.
 * @module FetchLicenceExistsDal
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Checks whether a licence exists for the given licence reference.
 *
 * @param {string} licenceRef - The licence reference to check
 *
 * @returns {Promise<boolean>} Whether a matching licence exists in the database
 */
async function go(licenceRef) {
  const licence = await LicenceModel.query().where('licenceRef', licenceRef).select('licenceRef').first()

  return !!licence
}

module.exports = {
  go
}
