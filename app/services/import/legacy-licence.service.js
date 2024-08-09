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
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../lib/general.lib.js')

/**
 * Imports a licence from the legacy import tables. Maps and validates the data and then saves to the database.
 *
 * @param {string} licenceRef - The licence reference of the licence
 * @returns {Promise<Object>} an object representing the saved licence in the database
 */
async function go (licenceRef) {
  try {
    const startTime = currentTimeInNanoseconds()

    const licenceData = await FetchLegacyImportLicenceService.go(licenceRef)

    const licenceVersionsData = await FetchLegacyImportLicenceVersionsService.go(licenceData)

    const mappedLicenceData = LegacyImportLicenceMapper.go(licenceData, licenceVersionsData)

    const mappedLicenceVersionsData = LegacyImportLicenceVersionMapper.go(licenceVersionsData)

    ImportLicenceValidatorService.go(mappedLicenceData, mappedLicenceVersionsData)

    const savedLicence = await PersistLicenceService.go(mappedLicenceData)

    await PersistLicenceVersionsService.go(mappedLicenceVersionsData, savedLicence.id)
    calculateAndLogTimeTaken(startTime, 'Process licence', { licenceRef })
  } catch (error) {
    global.GlobalNotifier.omfg('Licence import failed', { licenceRef }, error)
  }
}

module.exports = {
  go
}
