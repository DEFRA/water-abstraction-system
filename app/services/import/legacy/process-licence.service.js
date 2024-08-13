'use strict'

/**
 * Imports a licence from the imports tables into the views
 * @module ImportLegacyProcessLicenceService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const FetchLicenceVersionsService = require('./fetch-licence-versions.service.js')
const ValidateLicenceService = require('../validate-licence.service.js')
const LicencePresenter = require('../../../presenters/import/legacy/licence.presenter.js')
const LicenceVersionsPresenter = require('../../../presenters/import/legacy/licence-versions.presenter.js')
const PersistLicenceService = require('../persist-licence.service.js')
const PersistLicenceVersionsService = require('../persist-licence-versions.service.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Imports a licence from the legacy import tables. Maps and validates the data and then saves to the database.
 *
 * @param {string} licenceRef - The licence reference of the licence
 * @returns {Promise<Object>} an object representing the saved licence in the database
 */
async function go (licenceRef) {
  try {
    const startTime = currentTimeInNanoseconds()

    const licenceData = await FetchLicenceService.go(licenceRef)

    const licenceVersionsData = await FetchLicenceVersionsService.go(licenceData)

    const mappedLicenceData = LicencePresenter.go(licenceData, licenceVersionsData)

    const mappedLicenceVersionsData = LicenceVersionsPresenter.go(licenceVersionsData)

    ValidateLicenceService.go(mappedLicenceData, mappedLicenceVersionsData)

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
