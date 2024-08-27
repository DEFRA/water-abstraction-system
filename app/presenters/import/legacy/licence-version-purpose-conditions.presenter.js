'use strict'

/**
 * Maps the legacy NALD licence version purpose conditions data to the WRLS format
 * @module LicenceVersionPurposeConditionsPresenter
 */

/**
 * Maps the legacy NALD licence version purpose conditions data to the WRLS format
 *
 * @param {ImportLegacyLicenceVersionPurposeConditionsType[]} licenceVersionPurposeConditions - the legacy NALD
 * licence version purpose conditions
 *
 * @returns {object} the NALD licence version purpose conditions data transformed into the WRLS format ready for
 * validation and persisting
 */
function go (licenceVersionPurposeConditions) {
  return licenceVersionPurposeConditions.map((condition) => {
    return {
      code: condition.code,
      param1: condition.param1,
      param2: condition.param2,
      notes: condition.notes,
      externalId: condition.external_id
    }
  })
}

module.exports = {
  go
}
