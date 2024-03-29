'use strict'

/**
 * Process the billing accounts for a given billing period and creates their supplementary bills
 * @module ProcessBillingPeriodService
 */

const BillModel = require('../../../models/bill.model.js')
const BillLicenceModel = require('../../../models/bill-licence.model.js')
const ProcessTransactionsService = require('./process-transactions.service.js')
const SendTransactionsService = require('../send-transactions.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

// const BillingConfig = require('../../../../config/billing.config.js')

/**
 * Process the billing accounts for a given billing period and creates their supplementary bills
 *
 * @param {module:BillRunModel} billRun - The newly created bill run we need to process
 * @param {Object} billingPeriod - An object representing the financial year the bills will be for
 * @param {module:ChargeVersionModel[]} billingAccounts - The billing accounts to create bills for
 *
 * @returns {Promise<Object>} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go (billRun, billingPeriod, bills) {
  let billRunIsPopulated = false

  if (bills.length === 0) {
    return billRunIsPopulated
  }

  for (const bill of bills) {
    const result = await _processBill(bill, billRun, billingPeriod)

    if (!billRunIsPopulated) {
      billRunIsPopulated = result
    }
  }

  // // We set the batch size and number of billing accounts here rather than determine them for every iteration of the
  // // loop. It's a very minor node towards performance.
  // const batchSize = BillingConfig.annual.batchSize
  // const billingAccountsCount = billingAccounts.length

  // // Loop through the billing accounts to be processed by the size of the batch. For example, if we have 100 billing
  // // accounts to process and the batch size is 10, we'll make 10 iterations of the loop
  // for (let i = 0; i < billingAccountsCount; i += batchSize) {
  //   // Use slice(start, end) to extract the next batch of billing accounts to process. For example, if we have 100
  //   // billing accounts, a batch size of 10 then
  //   //
  //   // - 1st pass: slice(0, 10) will return billingAccounts[0] to billingAccounts[9]
  //   // - 2nd pass: slice(10, 20) will return billingAccounts[10] to billingAccounts[19]
  //   //
  //   // Both the start and end params are zero-based indexes for the array being sliced. The bit that might confuse is
  //   // end is not inclusive!
  //   const accountsToProcess = billingAccounts.slice(i, i + batchSize)

  //   // NOTE: we purposefully loop through each billing account in the batch without awaiting them to be processed. This
  //   // is for performance purposes. If our batch size is 10 we'll start processing one after the other. We then wait for
  //   // all 10 to complete. The overall process time will only be that of the one that takes the longest. If we await
  //   // instead the overall time will be the sum of the time to process each one.
  //   const processes = accountsToProcess.map((accountToProcess) => {
  //     return _processBillingAccount(accountToProcess, billRun, billingPeriod)
  //   })

  //   const results = await Promise.all(processes)
  //   if (!billRunIsPopulated) {
  //     billRunIsPopulated = results.some((result) => result)
  //   }
  // }

  return billRunIsPopulated
}

async function _persistBillingData (bill, billLicences, transactions) {
  if (billLicences.length === 0) {
    return false
  }

  await BillModel.query().insert(bill)
  await BillLicenceModel.query().insert(billLicences)
  await TransactionModel.query().insert(transactions)

  return true
}

async function _processBill (bill, billRun, billingPeriod) {
  const { accountNumber, billingAccountId, billLicences } = bill
  const { externalId: billRunExternalId } = billRun

  const billLicencesToPersist = []
  const transactionsToPersist = []

  for (const billLicence of billLicences) {
    const { generatedTransactions, licence } = billLicence

    const cleansedTransactions = await ProcessTransactionsService.go(
      generatedTransactions, billingAccountId, billLicence, billingPeriod
    )

    if (cleansedTransactions.length === 0) {
      continue
    }

    await SendTransactionsService.go(cleansedTransactions, billRunExternalId, accountNumber, licence)

    billLicencesToPersist.push({
      id: billLicence.id,
      billId: billLicence.billId,
      licenceId: billLicence.licenceId,
      licenceRef: billLicence.licenceRef
    })
    transactionsToPersist.push(...cleansedTransactions)
  }

  return _persistBillingData(bill, billLicencesToPersist, transactionsToPersist)
}

module.exports = {
  go
}
