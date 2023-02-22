'use strict'

/**
 * Creates a billing invoice record
 *
 * @module CreateBillingInvoiceService
 */

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')

/**
 * Create a billing invoice for the provided invoice account and billing batch
 *
 * @param {module:InvoiceAccountModel} invoiceAccount An instance of `InvoiceAccountModel`
 * @param {Object} cmTransaction Data returned from the Charging Module relating to the transaction
 *
 * @returns {Object} The newly-created billing invoice record
 */
async function go (invoiceAccount, cmTransaction, billingBatchId) {
  const billingInvoice = await BillingInvoiceModel.query()
    .insert({
      invoiceAccountId: invoiceAccount.invoiceAccountId,
      address: {},
      invoiceAccountNumber: invoiceAccount.invoiceAccountNumber,
      netAmount: cmTransaction.netAmount,
      isCredit: cmTransaction.netAmount === null ? null : cmTransaction.netAmount < 0,
      billingBatchId
    })
    .returning('*')

  return billingInvoice
}

module.exports = {
  go
}
