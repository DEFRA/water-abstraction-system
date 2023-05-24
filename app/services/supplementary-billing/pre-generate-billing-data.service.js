'use strict'

/**
 * Pre-generates empty billing data which will be populated during billing processing
 * @module PreGenerateBillingDataService
 */

const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')

/**
 * Pre-generates empty billing data which will be populated during billing processing
 *
 * @param {*} chargeVersions
 * @param {*} invoiceAccounts
 * @param {*} billingBatchId
 * @param {*} billingPeriod
 *
 * @returns
 */
function go (chargeVersions, invoiceAccounts, billingBatchId, billingPeriod) {
  const billingInvoices = _preGenerateBillingInvoices(invoiceAccounts, billingBatchId, billingPeriod)
  const billingInvoiceLicences = _preGenerateBillingInvoiceLicences(chargeVersions, billingInvoices)

  return { billingInvoices, billingInvoiceLicences }
}

/**
  * We pre-generate billing invoice licences for every combination of billing invoice and licence in the charge versions
  * so that we don't need to fetch any data from the db during the main charge version processing loop. This function
  * generates the required billing invoice licences and returns an object where each key is a concatenated billing
  * invoice id and licence id, and each value is the billing invoice licence for that combination of billing invoice and
  * licence, ie:
  *
  * {
  *   'key-1': { billingInvoiceLicenceId: 'billing-invoice-licence-1', ... },
  *   'key-2': { billingInvoiceLicenceId: 'billing-invoice-licence-2', ... }
  * }
  */
function _preGenerateBillingInvoiceLicences (chargeVersions, billingInvoices) {
  const keyedBillingInvoiceLicences = chargeVersions.reduce((acc, chargeVersion) => {
    const { billingInvoiceId } = billingInvoices[chargeVersion.invoiceAccountId]
    const { licence } = chargeVersion

    const key = _billingInvoiceLicenceKey(billingInvoiceId, licence.licenceId)

    // The charge versions may contain a combination of billing invoice and licence multiple times, so we check to see
    // if this combination has already had a billing invoice licence generated for it and return early if so
    if (acc.key) {
      return acc
    }

    return {
      ...acc,
      [key]: GenerateBillingInvoiceLicenceService.go(billingInvoiceId, licence)
    }
  }, {})

  return keyedBillingInvoiceLicences
}

function _billingInvoiceLicenceKey (billingInvoiceId, licenceId) {
  return `${billingInvoiceId}-${licenceId}`
}

/**
  * We pre-generate billing invoices for every invoice account so that we don't need to fetch any data from the db
  * during the main charge version processing loop. This function generates the required billing invoice licences and
  * returns an object where each key is the invoice account id, and each value is the billing invoice, ie:
  *
  * {
  *   'uuid-1': { invoiceAccountId: 'uuid-1', ... },
  *   'uuid-2': { invoiceAccountId: 'uuid-2', ... }
  * }
  */
function _preGenerateBillingInvoices (invoiceAccounts, billingBatchId, billingPeriod) {
  const keyedBillingInvoices = invoiceAccounts.reduce((acc, invoiceAccount) => {
    // Note that the array of invoice accounts will already have been deduped so we don't need to check whether a
    // billing invoice licence already exists in the object before generating one
    return {
      ...acc,
      [invoiceAccount.invoiceAccountId]: GenerateBillingInvoiceService.go(
        invoiceAccount,
        billingBatchId,
        billingPeriod.endDate.getFullYear()
      )
    }
  }, {})

  return keyedBillingInvoices
}

module.exports = {
  go
}
