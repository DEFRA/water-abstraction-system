'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module LicenceService
 */

const PersistLicenceService = require('./persist-licence.service.js')
const LicenceValidatorService = require('./licence-validator.service.js')

/**
 * Validates and persists licence
 *
 * The licence should be mapped and in the correct format before being saved
 *
 * @param {Object} licenceData - The mapped licence data from the data source
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceData) {
  const validatedLicence = LicenceValidatorService.go(licenceData)

  const savedLicence = await PersistLicenceService.go(validatedLicence)

  console.log('Saved licence', savedLicence)
}

module.exports = {
  go
}
