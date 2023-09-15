'use strict'

/**
 * Pre-generates empty billing data which will be populated during billing processing
 * @module PreGenerateBillingDataService
 */

const FetchInvoiceAccountNumbersService = require('./fetch-invoice-account-numbers.service.js')
const GenerateBillService = require('./generate-bill.service.js')
const GenerateBillLicenceService = require('./generate-bill-licence.service.js')

/**
 * Pre-generates empty billing data which will be populated during billing processing. Returns an object which comprises
 * a keyed object of bills and a keyed object of bill licences. The bills are keyed by the bill ID, and the bill
 * licences are keyed by the concatenated bill id and licence id.
 * *
 * @param {module:ChargeInformationModel[]} chargeInformations Array of charge informations which provide the invoice
 * account ids and licences to use
 * @param {String} billRunId The bill run id to be added to the billing invoices
 * @param {Object} billingPeriod The billing period of the billing invoices
 *
 * @returns {Object} An object containing bills and billLicences objects
 */
async function go (chargeInformations, billRunId, billingPeriod) {
  const invoiceAccounts = await FetchInvoiceAccountNumbersService.go(chargeInformations)

  const bills = _preGenerateBills(invoiceAccounts, billRunId, billingPeriod)
  const billLicences = _preGenerateBillLicences(chargeInformations, bills)

  return { bills, billLicences }
}

/**
  * We pre-generate bill licences for every combination of bill and licence in the charge informations so that we don't
  * need to fetch any data from the db during the main charge information processing loop. This function generates the
  * required bill licences and returns an object where each key is a concatenated bill id and licence id, and each value
  * is the bill licence for that combination of bill and licence, ie:
  *
  * {
  *   'key-1': { billingInvoiceLicenceId: 'bill-licence-1', ... },
  *   'key-2': { billingInvoiceLicenceId: 'bill-licence-2', ... }
  * }
  */
function _preGenerateBillLicences (chargeInformations, bills) {
  const keyedBillingInvoiceLicences = chargeInformations.reduce((acc, chargeInformation) => {
    const { billingInvoiceId: billId } = bills[chargeInformation.invoiceAccountId]
    const { licence } = chargeInformation

    const key = _billLicenceKey(billId, licence.licenceId)

    // The charge informations may contain a combination of bill and licence multiple times, so we check to see if this
    // combination has already had a bill licence generated for it and return early if so
    if (acc[key]) {
      return acc
    }

    return {
      ...acc,
      [key]: GenerateBillLicenceService.go(billId, licence)
    }
  }, {})

  return keyedBillingInvoiceLicences
}

function _billLicenceKey (billId, licenceId) {
  return `${billId}-${licenceId}`
}

/**
  * We pre-generate bills for every invoice account so that we don't need to fetch any data from the db during the main
  * charge information processing loop. This function generates the required bill licences and returns an object where
  * each key is the invoice account id, and each value is the bill, ie:
  *
  * {
  *   'uuid-1': { invoiceAccountId: 'uuid-1', ... },
  *   'uuid-2': { invoiceAccountId: 'uuid-2', ... }
  * }
  */
function _preGenerateBills (invoiceAccounts, billRunId, billingPeriod) {
  const keyedBills = invoiceAccounts.reduce((acc, invoiceAccount) => {
    // Note that the array of invoice accounts will already have been deduped so we don't need to check whether a
    // bill licence already exists in the object before generating one
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
