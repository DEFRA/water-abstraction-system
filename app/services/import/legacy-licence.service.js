'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module LegacyImportLicenceService
 */

const FetchLegacyImportLicenceService = require('./legacy-import/fetch-licence.service.js')
const FetchLegacyImportLicenceVersionsService = require('./legacy-import/fetch-licence-versions.service.js')
const LegacyImportLicenceMapper = require('./legacy-import/licence.mapper.js')
const LicenceValidatorService = require('./licence-validator.service.js')
const PersistLicenceService = require('./persist-licence.service.js')

/**
 * Imports a licence from the legacy import tables. Maps and validates the data and then saves to the database.
 *
 * @param {string} licenceRef - The licence reference of the licence
 * @returns {Promise<Object>} an object representing the saved licence in the database
 */
async function go (licenceRef) {
  console.debug('Importing licence ref: ', licenceRef)
  const licenceData = await FetchLegacyImportLicenceService.go(licenceRef)

  console.debug('Imported licence data: ', licenceData)
  const licenceVersionsData = await FetchLegacyImportLicenceVersionsService.go(licenceData)

  console.debug('Imported licence versions data: ', licenceVersionsData)

  const mappedLicenceData = await LegacyImportLicenceMapper.go(licenceData, licenceVersionsData)

  console.debug('Mapped imported licence data: ', mappedLicenceData)

  const validatedLicence = LicenceValidatorService.go(mappedLicenceData)

  const savedLicence = await PersistLicenceService.go(validatedLicence)

  console.debug('Saved Licence: ', savedLicence)

  return savedLicence
}

module.exports = {
  go
}
