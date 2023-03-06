'use strict'

/**
 * Determine if minimum charge applies to a charge version due to be billed
 * @module DetermineMinimumChargeService
 */

function go (chargeVersion, financialYearEnding) {
  const chargePeriod = _determineChargePeriod(chargeVersion, financialYearEnding)
  const chargePeriodStartDate = chargePeriod.startDate
  const chargeVersionStartDate = chargeVersion.startDate

  const isSharedStartDate = chargePeriodStartDate === chargeVersionStartDate

  const triggersMinimumCharge = chargeVersion.changeReason?.triggersMinimumCharge ?? false
  const isFirstChargeOnNewLicence = isSharedStartDate && triggersMinimumCharge

  // TODO: confirm whether legacy code is correct when it says return true if charge period starts on first april
  return isFirstChargeOnNewLicence
}

function _determineChargePeriod (chargeVersion, financialYearEnding) {
  const financialYearStartDate = new Date(financialYearEnding - 1, 3, 1)
  const chargeVersionStartDate = chargeVersion.startDate
  const latestStartDateTimestamp = Math.max(financialYearStartDate, chargeVersionStartDate)

  const financialYearEndDate = new Date(financialYearEnding, 2, 31)
  // If the charge version has no end date then use the financial year end date instead
  const chargeVersionEndDate = chargeVersion.endDate || financialYearEndDate
  const earliestEndDateTimestamp = Math.min(financialYearEndDate, chargeVersionEndDate)

  return {
    startDate: new Date(latestStartDateTimestamp),
    endDate: new Date(earliestEndDateTimestamp)
  }
}

module.exports = {
  go
}
