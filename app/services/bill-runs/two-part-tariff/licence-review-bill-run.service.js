'use strict'

/**
 * @module LicenceReviewBillRunService
 */

const FetchLicenceReviewReturnsService = require('./fetch-licence-review-returns.service.js')
const LicenceReviewBillRunPresenter = require('../../../presenters/bill-runs/two-part-tariff/licence-review-bill-run.presenter.js')

async function go (billRunId, licenceId) {
  const { returnLogs, licence } = await FetchLicenceReviewReturnsService.go(billRunId, licenceId)

  const preparedReturns = await LicenceReviewBillRunPresenter.go(returnLogs)

  const pageData = {
    licenceRef: licence.licenceRef,
    billRunId,
    status: 'review',
    licenceId,
    region: 'Anglian',
    billRunType: 'two-part tariff',
    chargePeriodDate: '1 April 2022 to 31 March 2023'
  }

  pageData.returns = preparedReturns

  return { pageData }
}

module.exports = {
  go
}
