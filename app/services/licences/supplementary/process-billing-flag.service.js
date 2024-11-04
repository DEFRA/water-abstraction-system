'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module ProcessBillingFlagService
 */

const DetermineBillingYearsService = require('./determine-billing-years.service.js')
const DetermineChargeVersionFlagsService = require('./determine-charge-version-flags.service.js')
const DetermineExistingBillRunYearsService = require('./determine-existing-bill-run-years.service.js')
const DetermineImportedLicenceFlagsService = require('./determine-imported-licence-flags.service.js')
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
      // Don't need to maintain the old recalculate bills link - This might get used for the other service logic instead
    } else {
      return
    }

    const {
      licenceId,
      regionId,
      startDate,
      endDate,
      flagForPreSrocSupplementary,
      flagForSrocSupplementary,
      flagForTwoPartTariffSupplementary
    } = result

    let twoPartTariffBillingYears = []

    if (flagForTwoPartTariffSupplementary) {
      const years = DetermineBillingYearsService.go(startDate, endDate)

      if (!years) {
        return
      }

      twoPartTariffBillingYears = await DetermineExistingBillRunYearsService.go(
        regionId, years, flagForTwoPartTariffSupplementary
      )
    }

    await PersistSupplementaryBillingFlagsService.go(
      twoPartTariffBillingYears,
      flagForPreSrocSupplementary,
      flagForSrocSupplementary,
      licenceId
    )

    calculateAndLogTimeTaken(startTime, 'Supplementary Billing Flag complete', { licenceId })
  } catch (error) {
    global.GlobalNotifier.omfg('Supplementary Billing Flag failed', payload, error)
  }
}

module.exports = {
  go
}
