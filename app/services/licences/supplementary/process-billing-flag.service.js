'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module ProcessBillingFlagService
 */

const CreateLicenceSupplementaryYearService = require('./create-licence-supplementary-year.service.js')
const DetermineBillingYearsService = require('./determine-billing-years.service.js')
const DetermineExistingBillRunYearsService = require('./determine-existing-bill-run-years.service.js')
const DetermineChargeVersionYearsService = require('./determine-charge-version-years.service.js')
const DetermineReturnLogYearsService = require('./determine-return-log-years.service.js')
const DetermineWorkflowYearsService = require('./determine-workflow-years.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')

/**
 * Orchestrates flagging a licence for supplementary billing
 *
 * This service orchestrates the process of flagging a licence for supplementary billing.
 * It retrieves details of the charge version, including the licence information, start and end dates, whether the
 * charge version has two-part tariff indicators, and if it should be flagged for supplementary billing.
 *
 * If the licence qualifies for flagging, the relevant dates are passed to the `DetermineBillingYearsService`, which
 * calculates the years affected by the changes to the licence.
 *
 * If any SROC years are affected, they are passed to the `DetermineExistingBillRunYearsService`. This service checks
 * the affected years to see if they have had an annual or two-part tariff bill runs created. We avoid flagging any
 * years that haven't had an annual or two-part tariff bill run, as those changes will be captured when the bill run is
 * created.
 *
 * Finally, we call the `CreateLicenceSupplementaryYearService`, which persists our final list of years along with the
 * licence ID and whether two-part tariff is true.
 *
 * @param {object} payload - The payload from the request
 */
async function go (payload) {
  try {
    const startTime = currentTimeInNanoseconds()

    let result

    if (payload.chargeVersionId) {
      result = await DetermineChargeVersionYearsService.go(payload.chargeVersionId)
    } else if (payload.returnId) {
      result = await DetermineReturnLogYearsService.go(payload.returnId)
    } else if (payload.chargeVersionWorkflowId) {
      result = await DetermineWorkflowYearsService.go(payload.chargeVersionWorkflowId)
    } else {
      return
    }
    const { licence, startDate, endDate, twoPartTariff, flagForBilling } = result

    if (!flagForBilling) {
      return
    }

    const years = DetermineBillingYearsService.go(startDate, endDate)

    if (!years) {
      return
    }

    const financialYearEnds = await DetermineExistingBillRunYearsService.go(licence.regionId, years, twoPartTariff)

    if (financialYearEnds.length === 0) {
      return
    }

    await CreateLicenceSupplementaryYearService.go(licence.id, financialYearEnds, twoPartTariff)

    calculateAndLogTimeTaken(startTime, 'Supplementary Billing Flag complete', { licenceId: licence.id })
  } catch (error) {
    global.GlobalNotifier.omfg('Supplementary Billing Flag failed', payload, error)
  }
}

module.exports = {
  go
}
