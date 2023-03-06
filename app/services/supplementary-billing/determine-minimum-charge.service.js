'use strict'

/**
 * Determine if minimum charge applies to a charge version due to be billed
 * @module DetermineMinimumChargeService
 */

const DetermineChargePeriodService = require('./determine-charge-period.service.js')

/**
 * Checks if minimum charge applies to a charge version for the given billing period
 *
 * If the charge version's start date matches the start of the charging period, and the reason for its creation
 * is flagged as triggering a minimum charge this service will return true.
 *
 * If either of those tests is false then the service will return false.
 *
 * @param {module:ChargeVersionModel} chargeVersion the charge version being checked for minimum charge
 * @param {number} financialYearEnding the year the financial billing period ends
 *
 * @returns {boolean} true if minimum charge applies else false
 */
function go (chargeVersion, financialYearEnding) {
  const chargePeriod = DetermineChargePeriodService.go(chargeVersion, financialYearEnding)
  const chargePeriodStartTimestamp = chargePeriod.startDate.getTime()
  const chargeVersionStartTimestamp = chargeVersion.startDate.getTime()

  const isSharedStartDate = chargePeriodStartTimestamp === chargeVersionStartTimestamp

  const triggersMinimumCharge = chargeVersion.changeReason?.triggersMinimumCharge ?? false
  const isFirstChargeOnNewLicence = isSharedStartDate && triggersMinimumCharge

  // TODO: confirm whether legacy code is correct when it says return true if charge period starts on first april
  return isFirstChargeOnNewLicence
}

module.exports = {
  go
}
