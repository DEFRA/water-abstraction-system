'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module ProcessBillingFlagService
 */

const CreateLicenceSupplementaryYearService = require('./create-licence-supplementary-year.service.js')
const DetermineBillingYearsService = require('./determine-billing-years.service.js')
const DetermineBillRunsSentService = require('./determine-bill-runs-sent.service.js')
const FetchChargeVersionService = require('./fetch-charge-version.service.js')

/**
 * Orchestrates flagging a licence for supplementary billing based on the provided charge version.
 *
 * If a `chargeVersionId` is present in the payload, the service fetches the charge version, along with its relevant
 * charge references and licence details.
 *
 * If the charge version has any two-part tariff indicators on any of its charge references then it calls the
 * `DetermineSupplementaryBillingYearsService` where it will work out which financial year ends have been affected by
 * the change in the charge version.
 *
 * If there are years that have been affected, these are then passed to our `FlagSupplementaryBillingService`, which
 * checks if a bill run has already been sent for that affected year, and if it has it will then persist the flag in the
 * `LicenceSupplementaryYear` table.
 *
 * @param {Object} payload - The payload from the request to be validated
 */
async function go (payload) {
  try {
    if (!payload.chargeVersionID) {
      return
    }

    const { licence, startDate, endDate, twoPartTariff } = FetchChargeVersionService.go(payload.chargeVersionId)

    const years = DetermineBillingYearsService.go(startDate, endDate)

    if (!years) {
      return
    }

    const yearsToPersist = await DetermineBillRunsSentService.go(licence, years)

    if (yearsToPersist.length > 0) {
      await CreateLicenceSupplementaryYearService.go(licence.id, yearsToPersist, twoPartTariff)
    }
  } catch (error) {
    global.GlobalNotifier.omfg('Supplementary Billing Flag failed', payload, error)
  }
}

module.exports = {
  go
}
