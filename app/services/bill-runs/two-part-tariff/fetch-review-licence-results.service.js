'use strict'

/**
 * Fetches the review licence results and bill run data for a two-part tariff bill run
 * @module FetchReviewLicenceResultsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const ChargeReferenceModel = require('../../../models/charge-reference.model.js')
const ChargeElementModel = require('../../../models/charge-element.model.js')

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
  const chargeData = await _fetchChargeData(licenceId, billRunId)

  const { licenceRef, licenceHolder } = await _licenceRef(licenceId)

  return { reviewReturnResults, billRun, licenceRef, licenceHolder, chargeData }
}

async function _fetchChargeData (licenceId, billRunId) {
  const chargeVersions = await _fetchLicenceChargeVersions(licenceId, billRunId)

  for (const chargeVersion of chargeVersions) {
    const { chargeVersionId } = chargeVersion

    const chargePeriods = await _fetchChargePeriods(billRunId, licenceId, chargeVersionId)
    chargeVersion.chargePeriods = chargePeriods

    const chargeReferences = await _fetchChargeReferences(billRunId, licenceId, chargeVersionId)
    chargeVersion.chargeReferences = []

    let referenceIndex = 0
    for (const chargeReference of chargeReferences) {
      const { chargeReferenceId } = chargeReference

      const chargeReferenceData = await _fetchChargeReferenceData(chargeReferenceId)
      const chargeElements = []
      chargeVersion.chargeReferences.push({ chargeReferenceId, ...chargeReferenceData, chargeElements })

      const licenceChargeElements = await _fetchChargeElements(billRunId, licenceId, chargeVersionId, chargeReferenceId)

      for (const chargeElement of licenceChargeElements) {
        const chargeElementData = await _fetchChargeElementData(chargeElement.reviewChargeElementResults.chargeElementId)
        chargeVersion.chargeReferences[referenceIndex].chargeElements.push({ ...chargeElement.reviewChargeElementResults, ...chargeElementData })
      }

      referenceIndex++
    }
  }

  return chargeVersions
}

async function _fetchChargeElementData (chargeElementId) {
  return await ChargeElementModel.query()
    .findById(chargeElementId)
    .select('description', 'abstractionPeriodStartDay', 'abstractionPeriodEndDay', 'abstractionPeriodStartMonth', 'abstractionPeriodEndMonth')
}

async function _fetchChargeElements (billRunId, licenceId, chargeVersionId, chargeReferenceId) {
  return await ReviewResultModel.query()
    .where({ billRunId, licenceId, chargeVersionId, chargeReferenceId })
    .withGraphFetched('[reviewChargeElementResults]')
    .modifyGraph('reviewChargeElementResults', builder => {
      builder.select('id', 'chargeElementId', 'allocated', 'aggregate', 'chargeDatesOverlap')
    })
    .distinct('review_results.reviewChargeElementResultId')
}

async function _fetchChargeReferenceData (chargeReferenceId) {
  return await ChargeReferenceModel.query()
    .findById(chargeReferenceId)
    .join('charge_categories', 'charge_categories.id', 'charge_references.charge_category_id')
    .select('charge_categories.reference', 'charge_categories.short_description', 'charge_categories.min_volume', 'charge_categories.max_volume')
}

async function _fetchChargeReferences (billRunId, licenceId, chargeVersionId) {
  return await ReviewResultModel.query()
    .distinct('chargeReferenceId')
    .where({ billRunId, licenceId, chargeVersionId })
}

async function _fetchChargePeriods (billRunId, licenceId, chargeVersionId) {
  return await ReviewResultModel.query()
    .select('chargePeriodStartDate', 'chargePeriodEndDate')
    .where({ billRunId, licenceId, chargeVersionId })
    .first()
}

async function _fetchLicenceChargeVersions (licenceId, billRunId) {
  return ReviewResultModel.query()
    .distinct('chargeVersionId')
    .where({ billRunId, licenceId })
    .whereNotNull('chargeVersionId')
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
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select('licenceRef')
    .modify('licenceHolder')

  licence.licenceHolder = licence.$licenceHolder()

  return licence
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
