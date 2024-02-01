'use strict'

/**
 * @module LicenceReviewBillRunService
 */

const FetchLicenceReviewDataService = require('./fetch-licence-review-data.service.js')
const LicenceReviewBillRunPresenter = require('../../../presenters/bill-runs/two-part-tariff/licence-review-bill-run.presenter.js')
const PrepareLicenceReturnsService = require('../two-part-tariff/prepare-licence-returns.service.js')

async function go (billRunId, licenceId, status) {
  const { returnLogs, licence, billRun } = await FetchLicenceReviewDataService.go(billRunId, licenceId)

  const { matchedReturns, unmatchedReturns, chargePeriods } = await PrepareLicenceReturnsService.go(returnLogs)

  const pageData = await LicenceReviewBillRunPresenter.go(matchedReturns, unmatchedReturns, chargePeriods, licence, billRun, status)

  return { pageData }
}

module.exports = {
  go
}
