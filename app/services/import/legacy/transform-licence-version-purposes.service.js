'use strict'

/**
 * Transforms all NALD licence version purpose data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceVersionPurposesService
 */

const FetchLicenceVersionPurposesService = require('./fetch-licence-version-purposes.service.js')
const LicenceVersionPurposePresenter = require('../../../presenters/import/legacy/licence-version-purpose.presenter.js')
const LicenceVersionPurposeValidator = require('../../../validators/import/licence-version-purpose.validator.js')

/**
 * Transforms all NALD licence version purpose data into an object that matches the WRLS structure
 *
 * After transforming and validating the NALD licence version purpose data, it attaches it to the licence version on
 * the licence we're importing.
 *
 * @param {string} regionCode - The NALD region code for the licence being imported
 * @param {string} naldLicenceId - The NALD ID for the licence being imported
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 */
async function go(regionCode, naldLicenceId, transformedLicence) {
  const naldLicenceVersionPurposes = await FetchLicenceVersionPurposesService.go(regionCode, naldLicenceId)

  naldLicenceVersionPurposes.forEach((naldLicenceVersionPurpose) => {
    const matchingLicenceVersion = _matchingLicenceVersion(
      transformedLicence.licenceVersions,
      naldLicenceVersionPurpose
    )

    const transformedLicenceVersionPurpose = LicenceVersionPurposePresenter.go(naldLicenceVersionPurpose)

    LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)

    matchingLicenceVersion.licenceVersionPurposes.push(transformedLicenceVersionPurpose)
  })
}

function _matchingLicenceVersion(licenceVersions, naldLicenceVersionPurpose) {
  return licenceVersions.find((licenceVersion) => {
    return licenceVersion.externalId === naldLicenceVersionPurpose.version_external_id
  })
}

module.exports = {
  go
}
