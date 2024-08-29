'use strict'

/**
 * Transforms all NALD licence version purpose condition data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceVersionPurposeConditionsService
 */

const FetchLicenceVersionPurposeConditionsService = require('./fetch-licence-version-purpose-conditions.service.js')
const LicenceVersionPurposeConditionValidator = require('../../../validators/import/licence-version-purpose-condition.validator.js')
const LicenceVersionPurposeConditionPresenter = require('../../../presenters/import/legacy/licence-version-purpose-condition.presenter.js')

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
  const naldLicenceVersionPurposeConditions = await FetchLicenceVersionPurposeConditionsService.go(
    regionCode,
    naldLicenceId
  )

  for (const naldLicenceVersionPurposeCondition of naldLicenceVersionPurposeConditions) {
    const matchingLicenceVersionPurpose = _matchingLicenceVersionPurpose(
      transformedLicence.licenceVersions, naldLicenceVersionPurposeCondition
    )

    const transformedLicenceVersionPurposeCondition = LicenceVersionPurposeConditionPresenter.go(
      naldLicenceVersionPurposeCondition
    )

    LicenceVersionPurposeConditionValidator.go(transformedLicenceVersionPurposeCondition)

    matchingLicenceVersionPurpose.licenceVersionPurposeConditions.push(transformedLicenceVersionPurposeCondition)
  }
}

function _matchingLicenceVersionPurpose (licenceVersions, naldLicenceVersionPurposesCondition) {
  let matchedLicenceVersionPurpose

  // Because the licence version purpose we need to match is against a licence version, we need to iterate through them
  // till we find the one that contains our matching purpose.
  for (const licenceVersion of licenceVersions) {
    matchedLicenceVersionPurpose = licenceVersion.licenceVersionPurposes.find((purpose) => {
      return purpose.externalId === naldLicenceVersionPurposesCondition.purpose_external_id
    })

    // We have a match! Break the loop here
    if (matchedLicenceVersionPurpose) {
      break
    }

    // No match, so onto the next licence version
    continue
  }

  return matchedLicenceVersionPurpose
}

module.exports = {
  go
}
