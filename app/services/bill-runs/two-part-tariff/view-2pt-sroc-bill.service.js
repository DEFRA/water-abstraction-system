'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the bill run page
 * @module View2ptBillRunLicencesService
 */

const DetermineBillRunIssuesService = require('./determine-bill-run-issues.service.js')
const FetchBillRunLicenceDataService = require('./fetch-bill-run-licence-data.service.js')
const ReviewBillRunPresenter = require('../../../presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

async function go (id) {
  const preparedLicences = []
  const { billRun, licences } = await FetchBillRunLicenceDataService.go(id)

  for (const licence of licences) {
    const issues = await DetermineBillRunIssuesService.go(licence.licenceId)

    preparedLicences.push(ReviewBillRunPresenter.go(licence, issues))
  }

  return { billRun, preparedLicences }
}

module.exports = {
  go
}
