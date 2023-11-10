'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view bill page
 * @module ViewBillService
 */

const BillPresenter = require('../../presenters/bills/bill.presenter.js')
const FetchBillService = require('./fetch-bill-service.js')
const FetchBillingAccountService = require('./fetch-billing-account.service.js')
const LicenceSummariesPresenter = require('../../presenters/bills/licence-summaries.presenter.js')

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

  const billAndBillingAccountData = BillPresenter.go(bill, billingAccount)
  const additionalData = LicenceSummariesPresenter.go(licenceSummaries)

  return {
    ...billAndBillingAccountData,
    ...additionalData
  }
}

module.exports = {
  go
}
