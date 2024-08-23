'use strict'

/**
 * Transforms all NALD licence version data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceVersionsService
 */

const FetchLicenceVersionsService = require('./fetch-licence-versions.service.js')
const LicenceVersionPresenter = require('../../../presenters/import/legacy/licence-version.presenter.js')
const LicenceVersionValidator = require('../../../validators/import/licence-version.validator.js')

/**
 * Transforms all NALD licence version data into an object that matches the WRLS licence structure
 *
 * @param {string} regionCode - The NALD region code for the licence being imported
 * @param {string} naldLicenceId - The NALD ID for the licence being imported
 *
 * @returns {Promise<object[]>} an array of objects, each representing a WRLS licence version
 */
async function go (regionCode, naldLicenceId) {
  const naldLicenceVersions = await FetchLicenceVersionsService.go(regionCode, naldLicenceId)

  const transformedLicenceVersions = naldLicenceVersions.map((naldLicenceVersion) => {
    const transformedLicence = LicenceVersionPresenter.go(naldLicenceVersion)

    LicenceVersionValidator.go(transformedLicence)

    return transformedLicence
  })

  return transformedLicenceVersions
}

module.exports = {
  go
}
