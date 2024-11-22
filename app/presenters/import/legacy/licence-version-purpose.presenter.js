'use strict'

/**
 * Maps the legacy NALD licence version purpose data to the WRLS format
 * @module LicenceVersionPurposePresenter
 */

/**
 * Maps the legacy NALD licence version purpose data to the WRLS format
 *
 * @param {ImportLegacyLicenceVersionPurposeType} licenceVersionPurpose - the legacy NALD licence version purpose
 *
 * @returns {object} the NALD licence version purpose data transformed into the WRLS format ready for validation and
 * persisting
 */
function go(licenceVersionPurpose) {
  return {
    abstractionPeriodEndDay: licenceVersionPurpose.abstraction_period_end_day,
    abstractionPeriodEndMonth: licenceVersionPurpose.abstraction_period_end_month,
    abstractionPeriodStartDay: licenceVersionPurpose.abstraction_period_start_day,
    abstractionPeriodStartMonth: licenceVersionPurpose.abstraction_period_start_month,
    annualQuantity: licenceVersionPurpose.annual_quantity,
    dailyQuantity: licenceVersionPurpose.daily_quantity,
    externalId: licenceVersionPurpose.external_id,
    hourlyQuantity: licenceVersionPurpose.hourly_quantity,
    instantQuantity: licenceVersionPurpose.instant_quantity,
    notes: licenceVersionPurpose.notes,
    primaryPurposeId: licenceVersionPurpose.primary_purpose_id,
    purposeId: licenceVersionPurpose.purpose_id,
    secondaryPurposeId: licenceVersionPurpose.secondary_purpose_id,
    timeLimitedEndDate: licenceVersionPurpose.time_limited_end_date,
    timeLimitedStartDate: licenceVersionPurpose.time_limited_start_date,
    // Add an empty array property ready for when transforming and attaching licence version purpose conditions
    licenceVersionPurposeConditions: []
  }
}

module.exports = {
  go
}
