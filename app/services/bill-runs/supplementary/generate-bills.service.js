'use strict'

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const DetermineMinimumChargeService = require('../determine-minimum-charge.service.js')
const FetchBillingAccountsService = require('./fetch-billing-accounts.service.js')
const { generateUUID } = require('../../../lib/general.lib.js')
const GenerateTransactionsService = require('../generate-transactions.service.js')

async function go (billRun, billingPeriod) {
  const { id: billRunId, regionId } = billRun
  const billingAccounts = await FetchBillingAccountsService.go(regionId, billingPeriod)

  const bills = []
  const allLicenceIds = []

  billingAccounts.forEach((billingAccount) => {
    const bill = _instantiateBill(billingAccount, billRunId, billingPeriod.endDate.getFullYear())

    const { chargeVersions } = billingAccount

    chargeVersions.forEach((chargeVersion) => {
      const { licence } = chargeVersion

      allLicenceIds.push(licence.id)

      _setAndPopulateBillLicence(bill, billingPeriod, chargeVersion)
    })

    bills.push(bill)
  })

  return { bills, licenceIds: [...new Set(allLicenceIds)] }
}

function _instantiateBill (billingAccount, billRunId, financialYearEnding) {
  const { id: billingAccountId, accountNumber } = billingAccount

  return {
    id: generateUUID(),
    accountNumber,
    address: {}, // Address is set to an empty object for SROC billing invoices
    billingAccountId,
    billRunId,
    credit: false,
    financialYearEnding,
    billLicences: []
  }
}

function _setAndPopulateBillLicence (bill, billingPeriod, chargeVersion) {
  const { licence } = chargeVersion

  const billLicence = _findOrCreateBillLicence(bill, licence)

  const generatedTransactions = _generateTransactionData(billLicence.id, billingPeriod, chargeVersion)

  billLicence.generatedTransactions.push(...generatedTransactions)
}

function _findOrCreateBillLicence (bill, licence) {
  const { id: billId, billLicences } = bill
  const { id: licenceId, licenceRef } = licence

  let billLicence = billLicences.find((existingBillLicence) => {
    return existingBillLicence.licenceId === licenceId
  })

  if (!billLicence) {
    billLicence = {
      id: generateUUID(),
      billId,
      licenceId,
      licenceRef,
      generatedTransactions: [],
      // NOTE: We attach the licence because it contains other details needed when we send the transactions to the
      // charging module. That doesn't happen until the data is used in ProcessBillingPeriodService and we have found
      // this is the simplest way to get the data to the point it is needed `CreateTransactionPresenter`.
      licence
    }

    billLicences.push(billLicence)
  }

  return billLicence
}

function _generateTransactionData (billLicenceId, billingPeriod, chargeVersion) {
  try {
    // We only need to calculate the transactions for charge versions with a status of `current` (APPROVED). We still
    // check and possibly return previous transactions when ProcessTransactionsService is called next in
    // _createTransactions()
    if (chargeVersion.status !== 'current') {
      return []
    }

    // NOTE: There is a chance of creating an empty (invalid) chargePeriod. For example, the charge version has an
    // abstraction period of 1 Aug to 30 Sept but was revoked on 15 July. DetermineChargePeriodService will determine
    // there is no charge period in this scenario.
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

    if (!chargePeriod.startDate) {
      return []
    }

    const firstChargeOnNewLicence = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

    // We use flatMap as GenerateTransactionsService returns an array of transactions (depending on if a compensation
    // transaction is also created) and we need to return a 'flat' array of all transactions
    const transactions = chargeVersion.chargeReferences.flatMap((chargeReference) => {
      return GenerateTransactionsService.go(
        billLicenceId,
        chargeReference,
        billingPeriod,
        chargePeriod,
        firstChargeOnNewLicence,
        chargeVersion.licence.waterUndertaker
      )
    })

    return transactions
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToPrepareTransactions)
  }
}

module.exports = {
  go
}
