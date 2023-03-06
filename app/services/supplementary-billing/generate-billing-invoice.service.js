'use strict'

/**
 * Generates a billing invoice record ready for persisting
 *
 * @module CreateBillingInvoiceService
 */

const { randomUUID } = require('crypto')

const InvoiceAccountModel = require('../../models/crm-v2/invoice-account.model.js')

async function go (invoiceAccountId, billingBatchId, financialYearEnding, generatedBillingInvoices = []) {
  let billingInvoice = _existingBillingInvoice(invoiceAccountId, generatedBillingInvoices)

  if (billingInvoice) {
    return billingInvoice
  }

  const invoiceAccount = await InvoiceAccountModel.query().findById(invoiceAccountId)

  billingInvoice = {
    billingInvoiceId: randomUUID({ disableEntropyCache: true }),
    invoiceAccountId,
    address: {}, // Address is set to an empty object for SROC billing invoices
    invoiceAccountNumber: invoiceAccount.invoiceAccountNumber,
    billingBatchId,
    financialYearEnding,
    isCredit: false
  }
  generatedBillingInvoices.push(billingInvoice)

  return billingInvoice
}

function _existingBillingInvoice (invoiceAccountId, generatedBillingInvoices) {
  return generatedBillingInvoices.filter((invoice) => {
    return invoiceAccountId === invoice.invoiceAccountId
  })
}

module.exports = {
  go
}
