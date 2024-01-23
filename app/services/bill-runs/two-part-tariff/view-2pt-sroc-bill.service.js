'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the bill run page
 * @module View2ptBillRunLicencesService
 */

const DetermineBillRunIssuesService = require('./determine-bill-run-issues.service.js')
const FetchBillRunLicenceDataService = require('./fetch-bill-run-licence-data.service.js')
const ReviewBillRunPresenter = require('../../../presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

async function go (id) {
  const result = await FetchBillRunLicenceDataService.go(id)

  await DetermineBillRunIssuesService.go(result.licences)

  const { preparedBillRun: billRun, preparedLicences: licences } = await ReviewBillRunPresenter.go(result.billRun, result.licences)

  return { billRun, licences }
}

module.exports = {
  go
}
