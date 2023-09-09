'use strict'

/**
 * Pre-generates empty billing data which will be populated during billing processing
 * @module PreGenerateBillingDataService
 */

const FetchInvoiceAccountNumbersService = require('./fetch-invoice-account-numbers.service.js')
const GenerateBillService = require('./generate-bill.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')

/**
 * Pre-generates empty billing data which will be populated during billing processing. Returns an object which comprises
 * a keyed object of bills and a keyed object of billing invoice licences. The bills are keyed
 * by the bill ID, and the billing invoice licences are keyed by the concatenated bill id and
 * licence id.
 * *
 * @param {module:ChargeVersionModel[]} chargeVersions Array of charge versions which provide the invoice account ids and licences to use
 * @param {String} billRunId The bill run id to be added to the billing invoices
 * @param {Object} billingPeriod The billing period of the billing invoices
 *
 * @returns {Object} An object containing bills and billingInvoiceLicences objects
 */
async function go (chargeVersions, billRunId, billingPeriod) {
  const invoiceAccounts = await FetchInvoiceAccountNumbersService.go(chargeVersions)

  const bills = _preGenerateBills(invoiceAccounts, billRunId, billingPeriod)
  const billingInvoiceLicences = _preGenerateBillingInvoiceLicences(chargeVersions, bills)

  return { bills, billingInvoiceLicences }
}

/**
  * We pre-generate billing invoice licences for every combination of bill and licence in the charge versions
  * so that we don't need to fetch any data from the db during the main charge version processing loop. This function
  * generates the required billing invoice licences and returns an object where each key is a concatenated bill id and
  * licence id, and each value is the billing invoice licence for that combination of bill and
  * licence, ie:
  *
  * {
  *   'key-1': { billingInvoiceLicenceId: 'billing-invoice-licence-1', ... },
  *   'key-2': { billingInvoiceLicenceId: 'billing-invoice-licence-2', ... }
  * }
  */
function _preGenerateBillingInvoiceLicences (chargeVersions, bills) {
  const keyedBillingInvoiceLicences = chargeVersions.reduce((acc, chargeVersion) => {
    const { billingInvoiceId: billId } = bills[chargeVersion.invoiceAccountId]
    const { licence } = chargeVersion

    const key = _billingInvoiceLicenceKey(billId, licence.licenceId)

    // The charge versions may contain a combination of billing invoice and licence multiple times, so we check to see
    // if this combination has already had a billing invoice licence generated for it and return early if so
    if (acc[key]) {
      return acc
    }

    return {
      ...acc,
      [key]: GenerateBillingInvoiceLicenceService.go(billId, licence)
    }
  }, {})

  return keyedBillingInvoiceLicences
}

function _billingInvoiceLicenceKey (billingInvoiceId, licenceId) {
  return `${billingInvoiceId}-${licenceId}`
}

/**
  * We pre-generate bills for every invoice account so that we don't need to fetch any data from the db
  * during the main charge version processing loop. This function generates the required billing invoice licences and
  * returns an object where each key is the invoice account id, and each value is the bill, ie:
  *
  * {
  *   'uuid-1': { invoiceAccountId: 'uuid-1', ... },
  *   'uuid-2': { invoiceAccountId: 'uuid-2', ... }
  * }
  */
function _preGenerateBills (invoiceAccounts, billRunId, billingPeriod) {
  const keyedBills = invoiceAccounts.reduce((acc, invoiceAccount) => {
    // Note that the array of invoice accounts will already have been deduped so we don't need to check whether a
    // billing invoice licence already exists in the object before generating one
    return {
      ...acc,
      [invoiceAccount.invoiceAccountId]: GenerateBillService.go(
        invoiceAccount,
        billRunId,
        billingPeriod.endDate.getFullYear()
      )
    }
  }, {})

  return keyedBills
}

module.exports = {
  go
}
