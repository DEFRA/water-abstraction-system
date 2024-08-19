'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module LegacyImportLicenceService
 */

const FetchLegacyImportLicenceService = require('./legacy-import/fetch-licence.service.js')
const FetchLegacyImportLicenceVersionsService = require('./legacy-import/fetch-licence-versions.service.js')
const LegacyImportLicenceMapper = require('./legacy-import/licence.mapper.js')
const ImportLicenceValidatorService = require('./licence-validator.service.js')
const PersistLicenceService = require('./persist-licence.service.js')

/**
 * Imports a licence from the legacy import tables. Maps and validates the data and then saves to the database.
 *
 * @param {string} licenceRef - The licence reference of the licence
 * @returns {Promise<Object>} an object representing the saved licence in the database
 */
async function go (licenceRef) {
  const licenceData = await FetchLegacyImportLicenceService.go(licenceRef)

  const licenceVersionsData = await FetchLegacyImportLicenceVersionsService.go(licenceData)

  const mappedLicenceData = await LegacyImportLicenceMapper.go(licenceData, licenceVersionsData)

  ImportLicenceValidatorService.go(mappedLicenceData)

  const savedLicence = await PersistLicenceService.go(mappedLicenceData)

  return savedLicence
}

module.exports = {
  go
}
