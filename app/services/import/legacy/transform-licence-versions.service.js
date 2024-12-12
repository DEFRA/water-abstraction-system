'use strict'

/**
 * Transforms all NALD licence version data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceVersionsService
 */

const FetchLicenceVersionsService = require('./fetch-licence-versions.service.js')
const LicenceVersionPresenter = require('../../../presenters/import/legacy/licence-version.presenter.js')
const LicenceVersionValidator = require('../../../validators/import/licence-version.validator.js')

/**
 * Transforms all NALD licence version data into an object that matches the WRLS structure
 *
 * After transforming and validating the NALD licence version data, it attaches it to the licence we're importing.
 *
 * @param {string} regionCode - The NALD region code for the licence being imported
 * @param {string} naldLicenceId - The NALD ID for the licence being imported
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 */
async function go(regionCode, naldLicenceId, transformedLicence) {
  const naldLicenceVersions = await FetchLicenceVersionsService.go(regionCode, naldLicenceId)

  naldLicenceVersions.forEach((naldLicenceVersion) => {
    const transformedLicenceVersion = LicenceVersionPresenter.go(naldLicenceVersion)

    LicenceVersionValidator.go(transformedLicenceVersion)

    transformedLicence.licenceVersions.push(transformedLicenceVersion)
  })
}

module.exports = {
  go
}
