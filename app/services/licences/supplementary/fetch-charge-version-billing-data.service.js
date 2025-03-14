'use strict'

/**
 * Fetches the charge version billing data needed to determine the supplementary billing flags
 * @module FetchChargeVersionBillingDataService
 */

const { ref } = require('objection')

const BillRunModel = require('../../../models/bill-run.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')

const APRIL = 3

/**
 * Fetches the charge version billing data needed to determine the supplementary billing flags
 *
 * First we fetch the charge version that the change has been made on. If the charge version is pre-sroc (has a scheme
 * of `alcs`), then we don't need to fetch any of the billing data associated with the charge versions licence. A
 * change to a pre-sroc charge version won't affect the flags for sroc or two-part tariff supplementary billing.
 * If the charge version is an sroc one (scheme of `sroc`), then we fetch any SROC bill runs associated with the licence
 * These bill runs will then be used to determine the supplementary billing flags.
 *
 * @param {string} chargeVersionId - The UUID for the charge version which has changed
 *
 * @returns {object} - An object containing the charge version and related SROC bill runs
 */
async function go(chargeVersionId) {
  const chargeVersion = await _fetchChargeVersion(chargeVersionId)

  if (chargeVersion.scheme === 'alcs') {
    return { chargeVersion }
  }

  const changeDateFinancialYearEnd = _determineFinancialYearEnd(chargeVersion.startDate)
  const srocBillRuns = await _fetchSrocBillRuns(changeDateFinancialYearEnd, chargeVersion.licence.id)

  return { chargeVersion, srocBillRuns }
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

async function _fetchSrocBillRuns(changeDateFinancialYearEnd, licenceId) {
  return BillRunModel.query()
    .join('bills', 'bills.billRunId', 'billRuns.id')
    .join('billLicences', 'billLicences.billId', 'bills.id')
    .where('billLicences.licenceId', licenceId)
    .whereIn('billRuns.status', ['sent', 'ready', 'review'])
    .where('billRuns.scheme', 'sroc')
    .where('billRuns.toFinancialYearEnding', '>=', changeDateFinancialYearEnd)
    .select('billRuns.regionId', 'billRuns.scheme', 'billRuns.toFinancialYearEnding', 'billRuns.batchType')
    .distinct()
    .orderBy('billRuns.toFinancialYearEnding', 'asc')
}

module.exports = {
  go
}
