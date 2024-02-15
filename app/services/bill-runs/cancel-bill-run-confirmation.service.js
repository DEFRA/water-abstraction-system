'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 * @module CancelBillRunConfirmationService
 */

const BillRunModel = require('../../models/bill-run.model.js')
const CancelBillRunConfirmationPresenter = require('../../presenters/bill-runs/cancel-bill-run-confirmation.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 *
 * @param {string} id The UUID of the bill run to cancel
 *
 * @returns {Object} an object representing the `pageData` needed by the cancel bill run template. It contains details
 * of the bill run.
 */
async function go (id) {
  const billRun = await _fetchBillRun(id)

  const pageData = CancelBillRunConfirmationPresenter.go(billRun)

  return pageData
}

async function _fetchBillRun (id) {
  const billRun = await BillRunModel.query()
    .findById(id)
    .select('createdAt', 'toFinancialYearEnding', 'batchType', 'externalId')
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select('displayName')
    })

  return billRun
}

module.exports = {
  go
}
