'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view bill page
 * @module ViewBillService
 */

const FetchBillService = require('./fetch-bill-service.js')
const FetchBillingAccountService = require('./fetch-billing-account.service.js')
const MultiLicenceBillPresenter = require('../../presenters/bills/multi-licence-bill.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view bill page
 *
 * @param {string} id The UUID for the bill to view
 *
 * @returns {Object} a formatted representation of the bill, its bill run and billing account plus summaries for all
 * the licences linked to the bill for use in the bill view page
 */
async function go (id) {
  const { bill, licenceSummaries } = await FetchBillService.go(id)
  const billingAccount = await FetchBillingAccountService.go(bill.invoiceAccountId)

  return MultiLicenceBillPresenter.go(bill, licenceSummaries, billingAccount)
}

module.exports = {
  go
}
