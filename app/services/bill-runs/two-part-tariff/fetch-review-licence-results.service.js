'use strict'

/**
 * Fetches the review licence results and bill run data for a two-part tariff bill run
 * @module FetchReviewLicenceResultsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')
const LicenceModel = require('../../../models/licence.model.js')

/**
 * Fetches the review return results data for an individual licence in the bill run and the bill run data
 *
 * @param {String} billRunId UUID of the bill run
 * @param {String} licenceId UUID of the licence
 *
 * @returns {Promise<Object[]>} Contains an array of bill run data and review licence data
 */
async function go (billRunId, licenceId) {
  const billRun = await _fetchBillRun(billRunId)
  const reviewReturnResults = await _fetchReviewReturnResults(billRunId, licenceId)
  const chargeVersions = await _fetchLicenceChargeVersions(licenceId, billRunId)

  await _fetchChargePeriods(chargeVersions, licenceId, billRunId)

  console.log('Charge Versions :', chargeVersions)
  console.log('Charge Versions 1 :', chargeVersions[0].chargeReferences[0].chargeElements[0])
  console.log('Charge Versions 2 :', chargeVersions[1].chargeReferences[0])

  const { licenceRef } = await _licenceRef(licenceId)

  return { reviewReturnResults, billRun, licenceRef }
}

async function _fetchChargePeriods (chargeVersions, licenceId, billRunId) {
  for (const chargeVersion of chargeVersions) {
    const chargeVersionId = chargeVersion.chargeVersionId

    const chargePeriods = await ReviewResultModel.query()
      .select('chargePeriodStartDate', 'chargePeriodEndDate')
      .where({ billRunId, licenceId, chargeVersionId })
      .first()

    chargeVersion.chargePeriods = chargePeriods

    const chargeReferences = await ReviewResultModel.query()
      .distinct('chargeReferenceId')
      .where({ billRunId, licenceId, chargeVersionId })

    chargeVersion.chargeReferences = chargeReferences
    let index = 0
    for (const chargeReference of chargeReferences) {
      const chargeReferenceId = chargeReference.chargeReferenceId

      const chargeElements = await ReviewResultModel.query()
        .select('reviewChargeElementResultId', 'reviewReturnResultId')
        .where({ billRunId, licenceId, chargeVersionId, chargeReferenceId })
        .withGraphFetched('reviewChargeElementResults')
        .modifyGraph('reviewChargeElementResults', (builder) => {
          builder.select('*')
        })

      chargeVersion.chargeReferences[index].chargeElements = chargeElements
      index++
    }
  }
}

async function _fetchLicenceChargeVersions (licenceId, billRunId) {
  return ReviewResultModel.query()
    .distinct('chargeVersionId')
    .where({ billRunId, licenceId })
}

async function _fetchBillRun (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(
      'id',
      'fromFinancialYearEnding',
      'toFinancialYearEnding')
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select('displayName')
    })
}

async function _licenceRef (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select('licenceRef')
}

async function _fetchReviewReturnResults (billRunId, licenceId) {
  return ReviewResultModel.query()
    .where({ billRunId, licenceId })
    .whereNotNull('reviewReturnResultId')
    .select([
      'reviewReturnResultId',
      'reviewChargeElementResultId',
      'chargeVersionId',
      'chargePeriodStartDate',
      'chargePeriodEndDate'])
    .withGraphFetched('reviewReturnResults')
    .modifyGraph('reviewReturnResults', (builder) => {
      builder.select([
        'id',
        'returnId',
        'return_reference',
        'startDate',
        'endDate',
        'dueDate',
        'receivedDate',
        'status',
        'underQuery',
        'nilReturn',
        'description',
        'purposes',
        'quantity',
        'allocated',
        'abstractionOutsidePeriod'
      ])
    })
}

module.exports = {
  go
}
