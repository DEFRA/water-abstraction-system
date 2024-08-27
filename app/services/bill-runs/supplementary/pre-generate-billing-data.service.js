'use strict'

/**
 * Pre-generates empty billing data which will be populated during billing processing
 * @module PreGenerateBillingDataService
 */

const FetchBillingAccountsService = require('./fetch-billing-accounts.service.js')
const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Pre-generates empty billing data which will be populated during billing processing. Returns an object which comprises
 * a keyed object of bills and a keyed object of bill licences. The bills are keyed by the bill ID, and the bill
 * licences are keyed by the concatenated bill id and licence id.
 * *
 * @param {module:ChargeVersionModel[]} chargeVersions - Array of charge versions which provide the billing
 * accounts and licences to use
 * @param {string} billRunId - The bill run id to be added to the billing invoices
 * @param {object} billingPeriod - The billing period of the billing invoices
 *
 * @returns {Promise<object>} An object containing arrays of bills and billLicences objects
 */
async function go (chargeVersions, billRunId, billingPeriod) {
  const billingAccounts = await FetchBillingAccountsService.go(chargeVersions)

  const bills = _preGenerateBills(billingAccounts, billRunId, billingPeriod)
  const billLicences = _preGenerateBillLicences(chargeVersions, bills)

  return { bills, billLicences }
}

function _generateBill (billingAccountId, accountNumber, billRunId, financialYearEnding) {
  return {
    id: generateUUID(),
    accountNumber,
    address: {}, // Address is set to an empty object for SROC billing invoices
    billingAccountId,
    billRunId,
    credit: false,
    financialYearEnding
  }
}

function _generateBillLicence (billId, licenceId, licenceRef) {
  return {
    id: generateUUID(),
    billId,
    licenceId,
    licenceRef
  }
}

/**
 * We pre-generate bill licences for every combination of bill and licence in the charge versions so that we don't
 * need to fetch any data from the db during the main charge version processing loop. This function generates the
 * required bill licences and returns an object where each key is a concatenated bill id and licence id, and each value
 * is the bill licence for that combination of bill and licence, ie:
 *
 * ```javascript
 * {
 *   'key-1': { billLicenceId: 'bill-licence-1', ... },
 *   'key-2': { billLicenceId: 'bill-licence-2', ... }
 * }
 * ```
 *
 * @private
 */
function _preGenerateBillLicences (chargeVersions, bills) {
  const keyedBillLicences = chargeVersions.reduce((acc, chargeVersion) => {
    const { id: billId } = bills[chargeVersion.billingAccountId]
    const { id: licenceId, licenceRef } = chargeVersion.licence

    const key = _billLicenceKey(billId, licenceId)

    // The charge versions may contain a combination of bill and licence multiple times, so we check to see if this
    // combination has already had a bill licence generated for it and return early if so
    if (acc[key]) {
      return acc
    }

    return {
      ...acc,
      [key]: _generateBillLicence(billId, licenceId, licenceRef)
    }
  }, {})

  return keyedBillLicences
}

function _billLicenceKey (billId, licenceId) {
  return `${billId}-${licenceId}`
}

/**
 * We pre-generate bills for every billing account so that we don't need to fetch any data from the db during the main
 * charge version processing loop. This function generates the required bill licences and returns an object where
 * each key is the billing account id, and each value is the bill, ie:
 *
 * ```javascript
 * {
 *   'uuid-1': { id: 'uuid-1', ... },
 *   'uuid-2': { id: 'uuid-2', ... }
 * }
 * ```
 *
 * @private
 */
function _preGenerateBills (billingAccounts, billRunId, billingPeriod) {
  const keyedBills = billingAccounts.reduce((acc, billingAccount) => {
    const { id: billingAccountId, accountNumber } = billingAccount

    // Note that the array of billing accounts will already have been deduped so we don't need to check whether a
    // bill licence already exists in the object before generating one
    return {
      ...acc,
      [billingAccountId]: _generateBill(
        billingAccountId,
        accountNumber,
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
