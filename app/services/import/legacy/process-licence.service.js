'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module ImportLegacyProcessLicenceService
 */

const LicenceStructureValidator = require('../../../validators/import/licence-structure.validator.js')
const PersistLicenceService = require('../persist-licence.service.js')
const TransformLicenceService = require('./transform-licence.service.js')
const TransformLicenceVersionsService = require('./transform-licence-versions.service.js')
const TransformLicenceVersionPurposesService = require('./transform-licence-version-purposes.service.js')
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
    const { naldLicenceId, regionCode, transformedLicence } = await TransformLicenceService.go(licenceRef)

    // Pass the transformed licence through each transformation step, building the licence as we go
    await TransformLicenceVersionsService.go(regionCode, naldLicenceId, transformedLicence)
    await TransformLicenceVersionPurposesService.go(regionCode, naldLicenceId, transformedLicence)

    // Ensure the built licence has all the valid child records we require
    LicenceStructureValidator.go(transformedLicence)

    // Either insert or update the licence in WRLS
    const licenceId = await PersistLicenceService.go(transformedLicence)

    calculateAndLogTimeTaken(startTime, 'Legacy licence import complete', { licenceId, licenceRef })
  } catch (error) {
    global.GlobalNotifier.omfg('Legacy licence import errored', { licenceRef }, error)
  }
}

module.exports = {
  go
}