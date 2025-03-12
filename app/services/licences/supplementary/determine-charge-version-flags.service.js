'use strict'

/**
 * Determines if a licence with a change in charge version should be flagged for supplementary billing
 * @module DetermineChargeVersionFlagsService
 */

const { ref } = require('objection')

const BillRunModel = require('../../../models/bill-run.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')

const APRIL = 3

/**
 * Determines if a licence should be flagged for supplementary billing based on a change in charge version
 *
 * This service checks whether a licence should be flagged for supplementary billing by first determining if
 * there are any existing bill runs for the licence in relevant financial years. If bill runs exist,
 * flags are determined based on their batch type and scheme. If no bill runs exist, the decision is made
 * based on the changed charge versions details.
 *
 * If the scheme is `alcs`, the licence is flagged for pre-sroc supplementary billing.
 * If the scheme is `sroc`:
 * - With no two-part tariff indicators: The licence is flagged for Sroc supplementary billing.
 * - With two-part tariff indicators: The licence is flagged for two-part tariff supplementary billing.
 *
 * NOTE: Unlike pre-sroc and sroc flags (which apply at the licence level), two-part tariff flags are year specific.
 * They are stored in the `LicenceSupplementaryYears` table for each affected year of the charge version
 *
 * @param {string} chargeVersionId - The UUID for the charge version which has changed
 * @param {string} licenceId - The UUID for the licence associated with the charge version
 * @param {Date} changeDate - The date the charge version change starts on
 *
 * @returns {object} - An object containing the related licenceId, regionId, charge version start and end date and
 * licence supplementary billing flags
 */
async function go(chargeVersionId, licenceId, changeDate) {
  const changeDateFinancialYearEnd = _determineFinancialYearEnd(new Date(changeDate))
  const licenceBillRuns = await _fetchLicenceBillRuns(changeDateFinancialYearEnd, licenceId)

  if (licenceBillRuns.length === 0) {
    return _accessChargeVersion(chargeVersionId)
  }

  return _accessBillRuns(licenceBillRuns, licenceId, changeDate)
}

function _accessBillRuns(licenceBillRuns, licenceId, changeDate) {
  const flagForPreSrocSupplementary = licenceBillRuns.some((billRun) => {
    return billRun.scheme === 'alcs'
  })

  const flagForSrocSupplementary = licenceBillRuns.some((billRun) => {
    return billRun.scheme === 'sroc' && ['annual', 'supplementary'].includes(billRun.batchType)
  })

  const flagForTwoPartTariffSupplementary = licenceBillRuns.some((billRun) => {
    return billRun.scheme === 'sroc' && ['two_part_tariff', 'two_part_supplementary'].includes(billRun.batchType)
  })

  return {
    licenceId,
    startDate: changeDate,
    endDate: new Date(),
    regionId: licenceBillRuns[0].regionId,
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    flagForTwoPartTariffSupplementary
  }
}

async function _accessChargeVersion(chargeVersionId) {
  const { chargeReferences, licence, endDate, startDate, scheme } = await _fetchChargeVersion(chargeVersionId)

  return {
    licenceId: licence.id,
    regionId: licence.regionId,
    startDate,
    endDate,
    flagForPreSrocSupplementary: licence.includeInPresrocBilling === 'yes' || scheme === 'alcs',
    flagForSrocSupplementary: licence.includeInSrocBilling || scheme === 'sroc',
    flagForTwoPartTariffSupplementary: _twoPartTariffSrocIndicators(chargeReferences)
  }
}

function _determineFinancialYearEnd(date) {
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  return year
}

async function _fetchChargeVersion(chargeVersionId) {
  return ChargeVersionModel.query()
    .findById(chargeVersionId)
    .select(['id', 'scheme', 'startDate', 'endDate'])
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder.select(['id', 'scheme', ref('adjustments:s127').castBool().as('twoPartTariff')])
    })
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select(['id', 'regionId', 'includeInSrocBilling', 'includeInPresrocBilling'])
    })
}

async function _fetchLicenceBillRuns(changeDateFinancialYearEnd, licenceId) {
  return BillRunModel.query()
    .join('bills', 'bills.billRunId', 'billRuns.id')
    .join('billLicences', 'billLicences.billId', 'bills.id')
    .where('billLicences.licenceId', licenceId)
    .whereIn('billRuns.status', ['sent', 'ready', 'review'])
    .where('billRuns.toFinancialYearEnding', '>=', changeDateFinancialYearEnd)
    .select('billRuns.regionId', 'billRuns.scheme', 'billRuns.toFinancialYearEnding', 'billRuns.batchType')
    .distinct()
    .orderBy('billRuns.toFinancialYearEnding', 'asc')
}

function _twoPartTariffSrocIndicators(chargeReferences) {
  return chargeReferences.some((chargeReference) => {
    return chargeReference.twoPartTariff && chargeReference.scheme === 'sroc'
  })
}

module.exports = {
  go
}
