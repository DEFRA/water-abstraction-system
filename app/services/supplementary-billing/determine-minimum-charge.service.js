'use strict'

/**
 * Determine if minimum charge applies to a charge version due to be billed
 * @module DetermineMinimumChargeService
 */

const DetermineChargePeriodService = require('./determine-charge-period.service.js')

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
