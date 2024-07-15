'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module LegacyLicenceService
 */

const LicenceService = require('./licence.service.js')
const LegacyImportLicenceService = require('./legacy-import/licence.service.js')

/**
 * Imports a licence from the imports tables into the views
 *
 * @param {string} licenceRef - The licence reference of the licence
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceRef) {
  const licenceData = await LegacyImportLicenceService.go(licenceRef)

  await LicenceService.go(licenceData)
}

module.exports = {
  go
}
