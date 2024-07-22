'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module LegacyImportLicenceService
 */

const FetchLegacyImportLicenceService = require('./legacy-import/fetch-licence.service.js')
const FetchLegacyImportLicenceVersionsService = require('./legacy-import/fetch-licence-versions.service.js')
const ImportLicenceValidatorService = require('./licence-validator.service.js')
const LegacyImportLicenceMapper = require('./legacy-import/licence.mapper.js')
const LegacyImportLicenceVersionMapper = require('./legacy-import/licence-versions.mapper.js')
const PersistLicenceService = require('./persist-licence.service.js')
const PersistLicenceVersionsService = require('./persist-licence-versions.service.js')

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

  const mappedLicenceData = LegacyImportLicenceMapper.go(licenceData, licenceVersionsData)

  const mappedLicenceVersionsData = LegacyImportLicenceVersionMapper.go(licenceVersionsData)

  console.debug('Mapped imported licence data: ', mappedLicenceData)

  console.debug('Mapped imported licence versions data: ', mappedLicenceVersionsData)

  ImportLicenceValidatorService.go(mappedLicenceData, mappedLicenceVersionsData)

  const savedLicence = await PersistLicenceService.go(mappedLicenceData)
  const savedLicenceVersions = await PersistLicenceVersionsService.go(mappedLicenceVersionsData, savedLicence.id)

  console.debug('Saved Licence: ', savedLicence)
  console.debug('Saved Licence versions: ', savedLicenceVersions)

  return savedLicence
}

module.exports = {
  go
}
