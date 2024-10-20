'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module ImportLegacyProcessLicenceService
 */

const DetermineSupplementaryBillingFlagsService = require('../determine-supplementary-billing-flags.service.js')
const LicenceStructureValidator = require('../../../validators/import/licence-structure.validator.js')
const PersistImportService = require('../persist-import.service.js')
const ProcessLicenceReturnLogsService = require('../../jobs/return-logs/process-licence-return-logs.service.js')
const TransformAddressesService = require('./transform-addresses.service.js')
const TransformLicenceDocumentService = require('./transform-licence-document.service.js')
const TransformLicenceDocumentRolesService = require('./transform-licence-document-roles.service.js')
const TransformCompaniesService = require('./transform-companies.service.js')
const TransformCompanyAddressesService = require('./transform-company-addresses.service.js')
const TransformContactsService = require('./transform-contacts.service.js')
const TransformLicenceService = require('./transform-licence.service.js')
const TransformLicenceVersionPurposeConditionsService = require('./transform-licence-version-purpose-conditions.service.js')
const TransformLicenceVersionPurposesService = require('./transform-licence-version-purposes.service.js')
const TransformLicenceVersionsService = require('./transform-licence-versions.service.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Imports a licence from the legacy import tables. Maps and validates the data and then saves to the database.
 *
 * @param {string} licenceRef - The licence reference of the licence
 *
 * @returns {Promise<object>} an object representing the saved licence in the database
 */
async function go (licenceRef) {
  try {
    const startTime = currentTimeInNanoseconds()

    // Transform the parent legacy licence record first
    const { naldLicenceId, regionCode, transformedLicence, wrlsLicenceId } =
      await TransformLicenceService.go(licenceRef)

    // We have other services that need to know when a licence has been imported. However, they only care about changes
    // to existing licences. So, if wrlsLicenceId is populated it means the import is updating an existing licence.
    if (wrlsLicenceId) {
      DetermineSupplementaryBillingFlagsService.go(transformedLicence, wrlsLicenceId)
      await ProcessLicenceReturnLogsService.go(wrlsLicenceId)
    }

    // Pass the transformed licence through each transformation step, building the licence as we go
    await TransformLicenceVersionsService.go(regionCode, naldLicenceId, transformedLicence)
    await TransformLicenceVersionPurposesService.go(regionCode, naldLicenceId, transformedLicence)
    await TransformLicenceVersionPurposeConditionsService.go(regionCode, naldLicenceId, transformedLicence)

    // Document
    await TransformLicenceDocumentService.go(regionCode, naldLicenceId, transformedLicence)
    await TransformLicenceDocumentRolesService.go(regionCode, naldLicenceId, transformedLicence, licenceRef)

    // Transform the company data
    const { transformedCompanies } = await TransformCompaniesService.go(regionCode, naldLicenceId)

    // Pass the transformed companies through each transformation step, building the company as we go
    await TransformContactsService.go(regionCode, naldLicenceId, transformedCompanies)
    await TransformAddressesService.go(regionCode, naldLicenceId, transformedCompanies)
    await TransformCompanyAddressesService.go(regionCode, naldLicenceId, transformedCompanies)

    // Ensure the built licence has all the valid child records we require
    LicenceStructureValidator.go(transformedLicence)

    // Either insert or update the licence in WRLS
    const licenceId = await PersistImportService.go(transformedLicence, transformedCompanies)

    calculateAndLogTimeTaken(startTime, 'Legacy licence import complete', { licenceId, licenceRef })
  } catch (error) {
    global.GlobalNotifier.omfg('Legacy licence import errored', { licenceRef }, error)
  }
}

module.exports = {
  go
}
