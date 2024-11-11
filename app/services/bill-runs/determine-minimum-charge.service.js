'use strict'

/**
 * Determine if minimum charge applies to a charge version due to be billed
 * @module DetermineMinimumChargeService
 */

/**
 * Checks if minimum charge applies to a charge version for the given billing period
 *
 * If the charge version's start date matches the start of the charging period, and the reason for its creation is
 * flagged as triggering a minimum charge this service will return true.
 *
 * If either of those tests is false then the service will return false.
 *
 * @param {module:ChargeVersionModel} chargeVersion - The charge version being checked for minimum charge
 * @param {object} chargePeriod - Object with a `startDate` and `endDate` property representing the chargeable period
 *
 * @returns {boolean} true if minimum charge applies else false
 */
function go(chargeVersion, chargePeriod) {
  const chargePeriodStartTimestamp = chargePeriod.startDate.getTime()
  const chargeVersionStartTimestamp = chargeVersion.startDate.getTime()

  const isSharedStartDate = chargePeriodStartTimestamp === chargeVersionStartTimestamp

  const triggersMinimumCharge = chargeVersion.changeReason?.triggersMinimumCharge ?? false
  const isFirstChargeOnNewLicence = isSharedStartDate && triggersMinimumCharge

  return isFirstChargeOnNewLicence
}

module.exports = {
  go
}
