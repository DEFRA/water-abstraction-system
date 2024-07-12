'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module ImportLicenceService
 */

const FetchImportLicenceService = require('./fetch-licence-from-import.service.js')
const ImportServiceLicenceMapper = require('./mappers/import-service/licence.mapper.js')
const PersistLicenceService = require('./persist-licence.service.js')

/**
 * Imports a licence from the imports tables into the views
 *
 * @param {string} licenceRef - The licence reference of the licence
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceRef) {
  try {
    console.debug('Ref: ', licenceRef)
    const licenceData = await FetchImportLicenceService.go(licenceRef)

    console.log('Licence data', licenceData)

    const mappedLicenceData = ImportServiceLicenceMapper.go(licenceData)

    console.log('Mapped licence data', mappedLicenceData)
    // validate

    // persist
    const savedLicence = await PersistLicenceService.go(mappedLicenceData)

    console.log('Saved licence', savedLicence)
  } catch (e) {
    //  Should we do this in the controller and pass the message back to import service ?
    console.error('Licence', licenceRef, 'failed to import: ', e)
  }
}

module.exports = {
  go
}
