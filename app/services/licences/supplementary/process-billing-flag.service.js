'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module ProcessBillingFlagService
 */

const DetermineBillFlagsService = require('./determine-bill-flags.service.js')
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
async function go (payload) {
  try {
    const startTime = currentTimeInNanoseconds()
    const result = await _determineFlags(payload)

    let licenceIds

    if (!result) {
      return
    } else if (result.length > 1) {
      await _setFlagsForMultipleLicences(result)

      licenceIds = result.map((item) => {
        return item.licenceId
      }).join(',')
    } else {
      await _setFlagForLicence(result)

      licenceIds = result.licenceId
    }

    calculateAndLogTimeTaken(startTime, 'Supplementary Billing Flag complete', { licenceIds })
  } catch (error) {
    global.GlobalNotifier.omfg('Supplementary Billing Flag failed', payload, error)
  }
}

async function _determineFlags (payload) {
  let result

  if (payload.importedLicence) {
    result = await DetermineImportedLicenceFlagsService.go(payload.importedLicence, payload.licenceId)
  } else if (payload.chargeVersionId) {
    result = await DetermineChargeVersionFlagsService.go(payload.chargeVersionId, payload.workflowId)
  } else if (payload.returnId) {
    result = await DetermineReturnLogFlagsService.go(payload.returnId)
  } else if (payload.workflowId) {
    result = await DetermineWorkflowFlagsService.go(payload.workflowId)
  } else if (payload.licenceId) {
    result = await DetermineLicenceFlagsService.go(payload.licenceId, payload.scheme)
  } else if (payload.billId) {
    // Removing a bill from a bill run is the only route that requires flagging for supplementary billing on
    // potentially more than 1 licence, hence why this is handled separate from the rest of the flagging
    result = await DetermineBillFlagsService.go(payload.billId)
  } else if (payload.billLicenceId) {
    result = await DetermineBillLicenceFlagsService.go(payload.billLicenceId)
  } else {
    return
  }

  return result
}

async function _determineTwoPartTariffYears (twoPartTariffBillingYears, result) {
  const { endDate, startDate, regionId, flagForTwoPartTariffSupplementary } = result
  const years = DetermineBillingYearsService.go(startDate, endDate)

  if (!years) {
    return twoPartTariffBillingYears
  }

  return await DetermineExistingBillRunYearsService.go(regionId, years, flagForTwoPartTariffSupplementary)
}

async function _setFlagForLicence (result) {
  const {
    licenceId,
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    flagForTwoPartTariffSupplementary
  } = result

  let twoPartTariffBillingYears = []

  if (flagForTwoPartTariffSupplementary) {
    twoPartTariffBillingYears = _determineTwoPartTariffYears(twoPartTariffBillingYears, result)
  }

  await PersistSupplementaryBillingFlagsService.go(
    twoPartTariffBillingYears,
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    licenceId
  )
}

async function _setFlagsForMultipleLicences (results) {
  for (const result of results) {
    await _setFlagForLicence(result)
  }
}

module.exports = {
  go
}
