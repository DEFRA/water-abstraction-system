'use strict'

/**
 * Determine if minimum charge applies to a charge version due to be billed
 * @module DetermineMinimumChargeService
 */

const DetermineChargePeriodService = require('./determine-charge-period.service.js')

/**
 * Checks if minimum charge applies to a charge version for the given billing period
 *
 * If the charge version's start date matches the start of the charging period, and the reason for its creation is
 * flagged as triggering a minimum charge this service will return true.
 *
 * If either of those tests is false then the service will return false.
 *
 * @param {module:ChargeVersionModel} chargeVersion The charge version being checked for minimum charge
 * @param {Number} financialYearEnding The year the financial billing period ends
 *
 * @returns {Boolean} true if minimum charge applies else false
 */
function go (chargeVersion, financialYearEnding) {
  const chargePeriod = DetermineChargePeriodService.go(chargeVersion, financialYearEnding)
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
