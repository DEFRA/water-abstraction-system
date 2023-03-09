'use strict'

/**
 * Generates a billing invoice record ready for persisting
 *
 * @module CreateBillingInvoiceService
 */

const { randomUUID } = require('crypto')

const InvoiceAccountModel = require('../../models/crm-v2/invoice-account.model.js')

async function go (generatedBillingInvoices, invoiceAccountId, billingBatchId, financialYearEnding) {
  let billingInvoice = _existing(generatedBillingInvoices, invoiceAccountId)

  if (billingInvoice) {
    return {
      billingInvoice,
      billingInvoices: generatedBillingInvoices
    }
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
  const updatedBillingInvoices = [...generatedBillingInvoices, billingInvoice]

  return {
    billingInvoice,
    billingInvoices: updatedBillingInvoices
  }
}

function _existing (generatedBillingInvoices, invoiceAccountId) {
  return generatedBillingInvoices.filter((invoice) => {
    return invoiceAccountId === invoice.invoiceAccountId
  })[0]
}

module.exports = {
  go
}
