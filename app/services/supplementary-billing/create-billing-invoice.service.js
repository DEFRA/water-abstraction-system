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
 * @param {Object} chargeVersion An Object containing the relevant charge version
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {string} billingBatchId GUID of the billing batch
 *
 * @returns {Object} The newly-created billing invoice record
 */
async function go (chargeVersion, billingPeriod, billingBatchId) {
  // TODO: REFACTOR THIS TO UPSERT INSTEAD OF RETRIEVE AND RETURN EXISTING
  const retrievedBillingInvoice = await BillingInvoiceModel.query()
    .where('invoiceAccountId', chargeVersion.invoiceAccountId)
    .where('billingBatchId', billingBatchId)
    .first()

  if (retrievedBillingInvoice) {
    return retrievedBillingInvoice
  }

  const billingInvoice = await BillingInvoiceModel.query()
    .insert({
      invoiceAccountId: chargeVersion.invoiceAccountId,
      address: {}, // Address is set to an empty object for SROC billing invoices
      invoiceAccountNumber: await _getInvoiceAccountNumber(chargeVersion.invoiceAccountId),
      billingBatchId,
      financialYearEnding: billingPeriod.endDate.getFullYear(),
      isCredit: false
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
