'use strict'

/**
 * Maps the legacy NALD licence version purpose condition data to the WRLS format
 * @module LicenceVersionPurposeConditionPresenter
 */

/**
 * Maps the legacy NALD licence version purpose condition data to the WRLS format
 *
 * @param {ImportLegacyLicenceVersionPurposeConditionType} licenceVersionPurposeCondition - the legacy NALD
 * licence version purpose conditions
 *
 * @returns {object} the NALD licence version purpose conditions data transformed into the WRLS format ready for
 * validation and persisting
 */
function go (licenceVersionPurposeCondition) {
  return {
    param1: licenceVersionPurposeCondition.param1,
    param2: licenceVersionPurposeCondition.param2,
    notes: licenceVersionPurposeCondition.notes,
    externalId: licenceVersionPurposeCondition.external_id,
    licenceVersionPurposeConditionTypeId: licenceVersionPurposeCondition.licence_version_purpose_condition_type_id
  }
}

module.exports = {
  go
}
