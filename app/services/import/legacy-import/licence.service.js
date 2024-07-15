'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module LegacyImportLicenceService
 */

const FetchLegacyImportLicenceService = require('./fetch-licence.service.js')
const FetchLegacyImportLicenceVersionsService = require('./fetch-licence-versions.service.js')
const LegacyImportLicenceMapper = require('./licence.mapper.js')

/**
 * Imports a licence from the imports tables into the views
 *
 * @param {string} licenceRef - The licence reference of the licence
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceRef) {
  console.debug('Ref: ', licenceRef)
  const licenceData = await FetchLegacyImportLicenceService.go(licenceRef)

  console.log('Licence data', licenceData)

  const { ID: licenceId, FGAC_REGION_CODE: regionCode } = licenceData

  const licenceVersionsData = await FetchLegacyImportLicenceVersionsService.go(licenceId, regionCode)

  return LegacyImportLicenceMapper.go(licenceData, licenceVersionsData)
}

module.exports = {
  go
}
