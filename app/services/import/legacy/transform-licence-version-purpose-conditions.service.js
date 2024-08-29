'use strict'

/**
 * Transforms all NALD licence version purpose conditions data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceVersionPurposeConditionsService
 */

const FetchLicenceVersionPurposeConditionsService = require('./fetch-licence-version-purpose-conditions.service.js')
const LicenceVersionPurposeConditionValidator = require('../../../validators/import/licence-version-purpose-condition.validator.js')
const LicenceVersionPurposeConditionsPresenter = require('../../../presenters/import/legacy/licence-version-purpose-conditions.presenter.js')

/**
 * Transforms all NALD licence version purpose conditions data into an object that matches the WRLS structure
 *
 * After transforming and validating the NALD licence version purpose conditions data, it attaches it to the
 * licence version purpose on the licence we're importing.
 *
 * @param {string} regionCode - The NALD region code for the licence being imported/
 * @param {string} naldLicenceId - The NALD ID for the licence being imported
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 */
async function go (regionCode, naldLicenceId, transformedLicence) {
  const naldLicenceVersionPurposesConditions = await
  FetchLicenceVersionPurposeConditionsService.go(regionCode, naldLicenceId)

  for (const naldLicenceVersionPurposesCondition of naldLicenceVersionPurposesConditions) {
    const matchingLicenceVersion =
      _matchingLicenceVersion(transformedLicence.licenceVersions, naldLicenceVersionPurposesCondition)

    const matchingLicenceVersionPurpose =
      _matchingLicenceVersionPurpose(matchingLicenceVersion, naldLicenceVersionPurposesCondition)

    const transformedLicenceVersionPurposeConditions = LicenceVersionPurposeConditionsPresenter
      .go(naldLicenceVersionPurposesCondition)

    LicenceVersionPurposeConditionValidator.go(transformedLicenceVersionPurposeConditions)

    matchingLicenceVersionPurpose.licenceVersionPurposeConditions.push(transformedLicenceVersionPurposeConditions)
  }
}

function _matchingLicenceVersion (licenceVersions, naldLicenceVersionPurposesCondition) {
  return licenceVersions.find((licenceVersion) => {
    return licenceVersion.licenceVersionPurposes.some((purpose) => {
      return purpose.externalId === naldLicenceVersionPurposesCondition.purpose_external_id
    })
  })
}

function _matchingLicenceVersionPurpose (licenceVersion, naldLicenceVersionPurposesCondition) {
  return licenceVersion.licenceVersionPurposes.find((purpose) => {
    return purpose.externalId === naldLicenceVersionPurposesCondition.purpose_external_id
  })
}

module.exports = {
  go
}
