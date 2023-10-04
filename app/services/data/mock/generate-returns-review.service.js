'use strict'

/**
 * Generates mock returns review based on a real one
 * @module GenerateReturnsReviewService
 */

const { db } = require('../../../../db/db.js')

const GenerateMockDataService = require('./generate-mock-data.service.js')
const MockReturnsReviewPresenter = require('../../../presenters/data/mock-returns-review.presenter.js')

async function go (id) {
  const reviewData = await _fetchReviewData(id)

  if (!reviewData) {
    throw new Error('No matching bill run exists')
  }

  const billRunInfo = _extractBillRunInfo(reviewData[0])
  const transformedReviewData = _transformToBeLicenceBased(reviewData)

  return _response(billRunInfo, transformedReviewData)
}

async function _fetchReviewData (id) {
  return db
    .select(
      'bb.billing_batch_id',
      'bb.bill_run_number',
      'bb.date_created',
      'bb.batch_type',
      'bb.scheme',
      'r.name AS region_name',
      'cv.licence_id',
      'cv.licence_ref',
      'cv.invoice_account_id',
      'ia.invoice_account_number',
      'bv.financial_year',
      'bv.calculated_volume',
      'bv.volume',
      'bv.two_part_tariff_status',
      'bv.two_part_tariff_error',
      'ce.description',
      'ce.source',
      'ce.season',
      'ce.loss',
      'ce.authorised_annual_quantity',
      'ce.abstraction_period_start_day',
      'ce.abstraction_period_start_month',
      'ce.abstraction_period_end_day',
      'ce.abstraction_period_end_month',
      'ce.billable_annual_quantity',
      'pu.description AS purpose'
    )
    .from('water.billing_batches AS bb')
    .innerJoin('water.regions AS r', 'r.region_id', 'bb.region_id')
    .innerJoin('water.billing_volumes AS bv', 'bv.billing_batch_id', 'bb.billing_batch_id')
    .innerJoin('water.charge_elements AS ce', 'ce.charge_element_id', 'bv.charge_element_id')
    .innerJoin('water.charge_versions AS cv', 'cv.charge_version_id', 'ce.charge_version_id')
    .innerJoin('crm_v2.invoice_accounts AS ia', 'ia.invoice_account_id', 'cv.invoice_account_id')
    .innerJoin('water.purposes_uses AS pu', 'pu.purpose_use_id', 'ce.purpose_use_id')
    .where({
      'bb.billing_batch_id': id
    })
    .orderBy('cv.licence_ref', 'bv.financial_year')
}

function _extractBillRunInfo (reviewDataResult) {
  const { billingBatchId, billRunNumber, dateCreated, batchType, scheme, regionName } = reviewDataResult

  return {
    billingBatchId,
    billRunNumber,
    dateCreated,
    batchType,
    scheme,
    regionName
  }
}

function _uniqueLicenceIds (allResults) {
  const allLicenceIds = allResults.map((result) => {
    return result.licenceId
  })

  const uniqueLicenceIds = [...new Set(allLicenceIds)]
  uniqueLicenceIds.sort()

  return uniqueLicenceIds
}

function _uniqueFinanceYears (resultsMatchedByLicence) {
  const allMatchedFinancialYears = resultsMatchedByLicence.map((result) => {
    return result.financialYear
  })

  const uniqueFinancialYears = [...new Set(allMatchedFinancialYears)]
  uniqueFinancialYears.sort()

  return uniqueFinancialYears
}

function _generateLicence (licenceId, resultsMatchedByLicence) {
  const { licenceRef } = resultsMatchedByLicence[0]

  const errored = resultsMatchedByLicence.some((result) => {
    return result.twoPartTariffError
  })

  const returnsEdited = resultsMatchedByLicence.some((result) => {
    return result.volume !== result.calculatedVolume
  })

  return {
    licenceId,
    licenceReference: licenceRef,
    billingContact: GenerateMockDataService.go().name,
    issue: '',
    errored,
    returnsEdited,
    financialYears: []
  }
}

function _transformToBeLicenceBased (reviewData) {
  const uniqueLicenceIds = _uniqueLicenceIds(reviewData)

  return uniqueLicenceIds.map((licenceId) => {
    const resultsMatchedByLicence = reviewData.filter((result) => {
      return result.licenceId === licenceId
    })

    const licence = _generateLicence(licenceId, resultsMatchedByLicence)

    const uniqueFinancialYears = _uniqueFinanceYears(resultsMatchedByLicence)

    uniqueFinancialYears.forEach((uniqueFinancialYear) => {
      const resultsMatchedByFinancialYear = resultsMatchedByLicence.filter((result) => {
        return result.financialYear === uniqueFinancialYear
      })

      const financialYear = {
        financialStartYear: uniqueFinancialYear - 1,
        financialEndYear: uniqueFinancialYear,
        resultsMatchedByFinancialYear
      }

      licence.financialYears.push(financialYear)
    })

    return licence
  })
}

function _response (billRunInfo, reviewData) {
  return MockReturnsReviewPresenter.go(billRunInfo, reviewData)
}

module.exports = {
  go
}
