'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the bill run page
 * @module ViewBillService
 */

const ViewBillRunPresenter = require('../../presenters/bill-runs/view-bill-run.presenter.js')
const ViewBillSummariesPresenter = require('../../presenters/bill-runs/view-bill-summaries.presenter.js')
const FetchBillRunService = require('./fetch-bill-run.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the bill run page
 *
 * @param {string} id The UUID for the bill run to view
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the view bill run template. It contains details of
 * the bill run and the bills linked to it plus the page title.
 */
async function go (id) {
  const result = await FetchBillRunService.go(id)

  const billRun = ViewBillRunPresenter.go(result.billRun, result.billSummaries)
  const billGroups = ViewBillSummariesPresenter.go(result.billSummaries)

  return {
    ...billRun,
    billGroupsCount: billGroups.length,
    billGroups
  }
}

module.exports = {
  go
}
