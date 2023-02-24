'use strict'

/**
 * Creates a billing invoice record
 *
 * @module CreateBillingInvoiceService
 */

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const FetchInvoiceAccountService = require('./fetch-invoice-account.service.js')

/**
 * Create the initial billing invoice for the provided charge version, billing period and billing batch prior to
 * transactions being sent to the charging module
 *
 * @param {Object[]} chargeVersion An Object containing the relevant charge version
 * @param {Object[]} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {string} billingBatchId GUID of the billing batch
 *
 * @returns {Object} The newly-created billing invoice record
 */
async function go (chargeVersion, billingPeriod, billingBatchId) {
  const billingInvoice = await BillingInvoiceModel.query()
    .insert({
      invoiceAccountId: chargeVersion.invoiceAccountId,
      address: {}, // Have left empty as doesn't appear to be used for SROC
      invoiceAccountNumber: await _getInvoiceAccountNumber(chargeVersion.invoiceAccountId),
      billingBatchId,
      financialYearEnding: billingPeriod.endDate.getFullYear()
    })
    .returning('*')

  return billingInvoice
}

async function _getInvoiceAccountNumber (invoiceAccountId) {
  const invoiceAccount = await FetchInvoiceAccountService.go(invoiceAccountId)

  return invoiceAccount.invoiceAccountNumber
}

module.exports = {
  go
}
