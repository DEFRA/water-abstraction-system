'use strict'

/**
 * Transforms all NALD licence version purpose data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceVersionPurposeConditionsService
 */

const FetchLicenceVersionPurposeConditionsService = require('./fetch-licence-version-purpose-conditions.service.js')
const LicenceVersionPurposeConditionsPresenter = require('../../../presenters/import/legacy/licence-version-purpose-conditions.presenter.js')
const LicenceVersionPurposeConditionValidator = require('../../../validators/import/licence-version-purpose-condition.validator.js')

/**
 * Transforms all NALD licence version purpose data into an object that matches the WRLS structure
 *
 * After transforming and validating the NALD licence version purpose data, it attaches it to the licence version on
 * the licence we're importing.
 *
 * @param {string} regionCode - The NALD region code for the licence being imported/
 * @param {string} naldLicenceId - The NALD ID for the licence being imported
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 */
async function go (regionCode, naldLicenceId, transformedLicence) {
  const naldLicenceVersionPurposesConditions = await
  FetchLicenceVersionPurposeConditionsService.go(regionCode, naldLicenceId)

  for (const licenceVersion of transformedLicence.licenceVersions) {
    for (const licenceVersionPurpose of licenceVersion.licenceVersionPurposes) {
      const matchingLicenceVersionPurposeConditions =
        _conditionsForLicenceVersionPurpose(licenceVersionPurpose, naldLicenceVersionPurposesConditions)

      const transformedLicenceVersionPurposeConditions = LicenceVersionPurposeConditionsPresenter
        .go(matchingLicenceVersionPurposeConditions)

      LicenceVersionPurposeConditionValidator.go(transformedLicenceVersionPurposeConditions)

      licenceVersionPurpose.licenceVersionPurposeConditions = transformedLicenceVersionPurposeConditions
    }
  }
}

function _conditionsForLicenceVersionPurpose (licenceVersionPurpose, conditions) {
  return conditions.filter((condition) => { return condition.purpose_external_id === licenceVersionPurpose.externalId })
}

module.exports = {
  go
}
