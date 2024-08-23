'use strict'

/**
 * Transforms all NALD licence version purpose data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceVersionPurposesService
 */

const FetchLicenceVersionPurposesService = require('./fetch-licence-version-purposes.service.js')
const LicenceVersionPurposePresenter = require('../../../presenters/import/legacy/licence-version-purpose.presenter.js')
const LicenceVersionPurposeValidator = require('../../../validators/import/licence-version-purpose.validator.js')

/**
 * Transforms all NALD licence version data into an object that matches the WRLS licence structure
 *
 * @param {string} regionCode - The NALD region code for the licence being imported
 * @param {string} naldLicenceId - The NALD ID for the licence being imported
 *
 * @returns {Promise<object[]>} an array of objects, each representing a WRLS licence version purpose
 */
async function go (regionCode, naldLicenceId) {
  const naldLicenceVersionPurposes = await FetchLicenceVersionPurposesService.go(regionCode, naldLicenceId)

  const transformedLicenceVersionPurposes = naldLicenceVersionPurposes.map((naldLicenceVersionPurpose) => {
    const transformedLicenceVersionPurpose = LicenceVersionPurposePresenter.go(naldLicenceVersionPurpose)

    LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)

    return transformedLicenceVersionPurpose
  })

  return transformedLicenceVersionPurposes
}

module.exports = {
  go
}
