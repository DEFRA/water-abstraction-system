'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 * @module ViewCancelBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ViewCancelBillRunPresenter = require('../../../presenters/bill-runs/view-cancel-bill-run.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 *
 * @param {string} id - The UUID of the bill run to cancel
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the cancel bill run template. It contains
 * details of the bill run.
 */
async function go(id) {
  const billRun = await _fetchBillRun(id)

  const pageData = ViewCancelBillRunPresenter.go(billRun)

  return pageData
}

async function _fetchBillRun(id) {
  return BillRunModel.query()
    .findById(id)
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
}

module.exports = {
  go
}
