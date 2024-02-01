'use strict'

/**
 * Pre-generates empty billing data which will be populated during billing processing
 * @module PreGenerateBillingDataService
 */

const FetchBillingAccountsService = require('./fetch-billing-accounts.service.js')
const GenerateBillLicenceService = require('./generate-bill-licence.service.js')
const { generateUUID } = require('../../../lib/general.lib.js')

async function go (chargeVersions, billRunId, billingPeriod) {
  const billingAccounts = await FetchBillingAccountsService.go(chargeVersions)

  return _process(billingAccounts, chargeVersions, billRunId, billingPeriod)
}

function _process (billingAccounts, chargeVersions, billRunId, billingPeriod) {
  const bills = []

  billingAccounts.forEach((billingAccount) => {
    const chargeVersionsForBill = chargeVersions.filter((chargeVersion) => {
      return chargeVersion.billingAccountId === billingAccount.id
    })

    const bill = {
      id: generateUUID(),
      accountNumber: billingAccount.accountNumber,
      address: {}, // Address is set to an empty object for SROC billing invoices
      billingAccountId: billingAccount.id,
      billRunId,
      credit: false,
      financialYearEnding: billingPeriod.endDate.getFullYear(),
      billLicences: _preGenerateBillLicences(chargeVersionsForBill)
    }

    bills.push(bill)
  })

  return bills
}

function _preGenerateBillLicences (chargeVersions, billId) {
  const keyedBillLicences = chargeVersions.reduce((acc, chargeVersion) => {
    const { licence } = chargeVersion

    const key = `${billId}-${licence.id}`

    // The charge versions may contain a combination of bill and licence multiple times, so we check to see if this
    // combination has already had a bill licence generated for it and return early if so
    if (acc[key]) {
      return acc
    }

    return {
      ...acc,
      [key]: GenerateBillLicenceService.go(billId, licence)
    }
  }, {})

  return keyedBillLicences
}

module.exports = {
  go
}
