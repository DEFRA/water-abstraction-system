'use strict'

/**
 * Determine if minimum charge applies to a charge information due to be billed
 * @module DetermineMinimumChargeService
 */

/**
 * Checks if minimum charge applies to a charge information for the given billing period
 *
 * If the charge information's start date matches the start of the charging period, and the reason for its creation is
 * flagged as triggering a minimum charge this service will return true.
 *
 * If either of those tests is false then the service will return false.
 *
 * @param {module:ChargeInformationModel} chargeInformation The charge information being checked for minimum charge
 * @param {Object} chargePeriod Object with a `startDate` and `endDate` property representing the chargeable period
 *
 * @returns {Boolean} true if minimum charge applies else false
 */
function go (chargeInformation, chargePeriod) {
  const chargePeriodStartTimestamp = chargePeriod.startDate.getTime()
  const chargeInformationStartTimestamp = chargeInformation.startDate.getTime()

  const isSharedStartDate = chargePeriodStartTimestamp === chargeInformationStartTimestamp

  const triggersMinimumCharge = chargeInformation.changeReason?.triggersMinimumCharge ?? false
  const isFirstChargeOnNewLicence = isSharedStartDate && triggersMinimumCharge

  return isFirstChargeOnNewLicence
}

module.exports = {
  go
}
