'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the bill run page
 * @module ViewBillService
 */

const EmptyBillRunPresenter = require('../../presenters/bill-runs/empty-bill-run-presenter.js')
const ErroredBillRunPresenter = require('../../presenters/bill-runs/errored-bill-run-presenter.js')
const ViewBillRunPresenter = require('../../presenters/bill-runs/view-bill-run.presenter.js')
const ViewBillSummariesPresenter = require('../../presenters/bill-runs/view-bill-summaries.presenter.js')
const FetchBillRunService = require('./fetch-bill-run.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the bill run page
 *
 * @param {string} id - The UUID for the bill run to view
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view bill run template. It contains
 * details of the bill run and the bills linked to it plus the page title.
 */
async function go(id) {
  const result = await FetchBillRunService.go(id)

  const formattedData = _pageData(result)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

function _pageData(fetchResult) {
  const { billRun, billSummaries } = fetchResult

  if (billRun.status === 'empty') {
    return {
      view: 'bill-runs/empty.njk',
      ...EmptyBillRunPresenter.go(billRun)
    }
  }

  if (billRun.status === 'error') {
    return {
      view: 'bill-runs/errored.njk',
      ...ErroredBillRunPresenter.go(billRun)
    }
  }

  const billGroups = ViewBillSummariesPresenter.go(billSummaries)

  return {
    view: 'bill-runs/view.njk',
    ...ViewBillRunPresenter.go(billRun, billSummaries),
    billGroupsCount: billGroups.length,
    billGroups
  }
}

module.exports = {
  go
}
