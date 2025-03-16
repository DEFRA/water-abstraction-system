'use strict'

/**
 * Determines if a licence should be flagged for supplementary billing based on a change in charge version
 * @module DetermineChargeVersionFlagsService
 */

const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')

const FetchChargeVersionBillingDataService = require('./fetch-charge-version-billing-data.service.js')

/**
 * Determines if a licence should be flagged for supplementary billing based on a change in charge version
 *
 * This service checks whether a licence should be flagged for supplementary billing by first determining if there are
 * any existing bill runs for the licence in relevant financial years. If bill runs exist, flags are determined based on
 * their batch type and scheme. If no bill runs exist, the decision is made based on the changed charge versions
 * details.
 *
 * If the scheme is `alcs`, the licence is flagged for pre-sroc supplementary billing. If the scheme is `sroc`:
 *
 * - With no two-part tariff indicators: The licence is flagged for SROC supplementary billing.
 * - With two-part tariff indicators: The licence is flagged for two-part tariff supplementary billing.
 *
 * NOTE: Unlike pre-sroc and sroc flags (which apply at the licence level), two-part tariff flags are year specific.
 * They are stored in the `LicenceSupplementaryYears` table for each affected year of the charge version
 *
 * @param {string} chargeVersionId - The UUID for the charge version which has changed
 *
 * @returns {object} - An object containing the related licenceId, regionId, charge version start and end date and
 * licence supplementary billing flags
 */
async function go(chargeVersionId) {
  const { chargeVersion, srocBillRuns } = await FetchChargeVersionBillingDataService.go(chargeVersionId)
  const { chargeReferences, licence, endDate, startDate, scheme } = chargeVersion

  const result = {
    licenceId: licence.id,
    startDate,
    endDate,
    regionId: chargeVersion.licence.regionId,
    flagForPreSrocSupplementary: licence.includeInPresrocBilling === 'yes',
    flagForSrocSupplementary: licence.includeInSrocBilling,
    flagForTwoPartTariffSupplementary: false
  }

  const futureChargeVersion = _futureChargeVersion(chargeVersion)

  // If the charge version starts after the current financial year, nothing will have been billed so nothing is effected
  if (futureChargeVersion) {
    return result
  }

  // If the charge version is PRE-SROC (alcs), it _has_ to be in the past so the licence will need checking
  if (scheme === 'alcs') {
    result.flagForPreSrocSupplementary = true

    return result
  }

  result.flagForSrocSupplementary = _flagForSrocSupplementary(srocBillRuns, chargeReferences)
  result.flagForTwoPartTariffSupplementary = _flagForTwoPartTariffSupplementary(srocBillRuns, chargeReferences)

  return result
}

function _flagForSrocSupplementary(srocBillRuns, chargeReferences) {
  const flagForSrocSupplementary = srocBillRuns.some((billRun) => {
    return ['annual', 'supplementary'].includes(billRun.batchType)
  })

  if (flagForSrocSupplementary) {
    return true
  }

  // If there are no charge references attached to the charge version it means its a non-chargeable charge version.
  // So, if its not been included in a bill run then we don't need to flag it.
  return chargeReferences.length > 0
}

/**
 * We first check the bill runs for 2 reasons
 *
 * - Confirming the licence has been in a two-part tariff bill run confirms the change must checked by supplementary
 * - The change might have been to remove two-part tariff from the licence, or making it non-chargeable
 *
 * If the second reason, the new charge version won't have the two-part tariff agreement set to true. But we still need
 * to process the licence in supplementary billing in case the change means we need to credit a historic transaction.
 *
 * If the licence has not been in a two-part tariff bill run for the period affected, _then_ we fall back on checking
 * the charge version itself.
 *
 * @private
 */
function _flagForTwoPartTariffSupplementary(srocBillRuns, chargeReferences) {
  const flagForTwoPartTariffSupplementary = srocBillRuns.some((billRun) => {
    return ['two_part_tariff', 'two_part_supplementary'].includes(billRun.batchType)
  })

  if (flagForTwoPartTariffSupplementary) {
    return true
  }

  return _twoPartTariffSrocIndicators(chargeReferences)
}

function _futureChargeVersion(chargeVersion) {
  const currentFinancialYear = determineCurrentFinancialYear()

  return chargeVersion.startDate > currentFinancialYear.endDate
}

function _twoPartTariffSrocIndicators(chargeReferences) {
  return chargeReferences.some((chargeReference) => {
    return chargeReference.twoPartTariff && chargeReference.scheme === 'sroc'
  })
}

module.exports = {
  go
}
