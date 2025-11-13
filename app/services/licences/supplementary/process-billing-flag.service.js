'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module ProcessBillingFlagService
 */

const DetermineBillingYearsService = require('./determine-billing-years.service.js')
const DetermineBillLicenceFlagsService = require('./determine-bill-licence-flags.service.js')
const DetermineChargeVersionFlagsService = require('./determine-charge-version-flags.service.js')
const DetermineExistingBillRunYearsService = require('./determine-existing-bill-run-years.service.js')
const DetermineImportedLicenceFlagsService = require('./determine-imported-licence-flags.service.js')
const DetermineLicenceFlagsService = require('./determine-licence-flags.service.js')
const DetermineReturnLogFlagsService = require('./determine-return-log-flags.service.js')
const DetermineWorkflowFlagsService = require('./determine-workflow-flags.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const PersistSupplementaryBillingFlagsService = require('./persist-supplementary-billing-flags.service.js')

/**
 * Orchestrates flagging a licence for supplementary billing
 *
 * This service orchestrates the process of flagging a licence for supplementary billing.
 * Based on the ID the service receives, it retrieves details of the related licence and charge versions, including
 * start and end dates (these are used to work out which two-part tariff years to flag), whether the charge version has
 * two-part tariff indicators, and if it should be flagged for pre-sroc, sroc and two-part tariff supplementary billing.
 *
 * If the licence qualifies for two-part tariff flagging, the relevant dates are passed to the
 * `DetermineBillingYearsService`, which calculates the years affected by the changes to the licence.
 *
 * If any SROC years are affected, they are passed to the `DetermineExistingBillRunYearsService`. This service checks
 * the affected years to see if they have had an annual or two-part tariff bill runs created. We avoid flagging any
 * years that haven't had an annual or two-part tariff bill run, as those changes will be captured when the bill run is
 * created.
 *
 * Finally, we call the `PersistSupplementaryBillingFlagsService`, which persists all the flags we have determined.
 *
 * @param {object} payload - The payload from the request
 */
async function go(payload) {
  try {
    const startTime = currentTimeInNanoseconds()
    const result = await _determineFlags(payload)

    await _setFlagForLicence(result)

    calculateAndLogTimeTaken(startTime, 'Supplementary Billing Flag complete', { licenceId: result.licenceId })
  } catch (error) {
    global.GlobalNotifier.omfg('Supplementary Billing Flag failed', payload, error)
  }
}

/**
 * Determines which flags to set for supplementary billing
 *
 * This function takes a payload and determines which flags should be set for supplementary billing.
 * It does this by calling the relevant service based on the presence of certain properties in the payload,
 * such as `licenceId`, `importedLicence`, `chargeVersionId`, `returnId`, `workflowId`, and `billLicenceId`.
 * The results are then returned.
 *
 * @private
 */
async function _determineFlags(payload) {
  if (payload.changedDateDetails) {
    return DetermineImportedLicenceFlagsService.go(payload.licenceId, payload.changedDateDetails.changeDate)
  }
  if (payload.chargeVersionId) {
    return DetermineChargeVersionFlagsService.go(payload.chargeVersionId)
  }
  if (payload.returnLogId) {
    return DetermineReturnLogFlagsService.go(payload.returnLogId)
  }
  if (payload.workflowId) {
    return DetermineWorkflowFlagsService.go(payload.workflowId)
  }
  if (payload.billLicenceId) {
    return DetermineBillLicenceFlagsService.go(payload.billLicenceId)
  }
  if (payload.licenceId) {
    return DetermineLicenceFlagsService.go(payload.licenceId, payload.scheme)
  }

  throw new Error('Invalid payload for process billing flags service')
}

async function _determineTwoPartTariffYears(twoPartTariffBillingYears, result) {
  const { endDate, startDate, regionId, flagForTwoPartTariffSupplementary } = result
  const years = DetermineBillingYearsService.go(startDate, endDate)

  if (!years) {
    return twoPartTariffBillingYears
  }

  return DetermineExistingBillRunYearsService.go(regionId, years, flagForTwoPartTariffSupplementary)
}

async function _setFlagForLicence(result) {
  const { licenceId, flagForPreSrocSupplementary, flagForSrocSupplementary, flagForTwoPartTariffSupplementary } = result

  let twoPartTariffBillingYears = []

  if (flagForTwoPartTariffSupplementary) {
    twoPartTariffBillingYears = await _determineTwoPartTariffYears(twoPartTariffBillingYears, result)
  }

  await PersistSupplementaryBillingFlagsService.go(
    twoPartTariffBillingYears,
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    licenceId
  )
}

module.exports = {
  go
}
