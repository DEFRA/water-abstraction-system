'use strict'

/**
 * Handles the reissuing of bills
 * @module ReissueBillsService
 */

const BillModel = require('../../../models/bill.model.js')
const BillLicenceModel = require('../../../models/bill-licence.model.js')
const FetchBillsToBeReissuedService = require('./fetch-bills-to-be-reissued.service.js')
const ReissueBillService = require('./reissue-bill.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

/**
 * Handles the reissuing of bills
 *
 * We receive the bill run that the reissued bills are to be created on and infer from this the region to be
 * reissued. We check this region for bills marked for reissuing. For each one of these we call
 * `ReissueBillService` which handles the actual reissuing of an bill and collects the returned bill, invoice
 * licence and transaction data which we batch persist once all bills have been reissued. Finally, we return a boolean
 * to indicate whether or not any bills were reissued.
 *
 * @param {module:BillRunModel} reissueBillRun - The bill run that the reissued bills will be created on
 *
 * @returns {Promise<boolean>} `true` if any bills were reissued; `false` if not
 */
async function go (reissueBillRun) {
  const sourceBills = await FetchBillsToBeReissuedService.go(reissueBillRun.regionId)

  if (sourceBills.length === 0) {
    return false
  }

  const dataToPersist = {
    bills: [],
    billLicences: [],
    transactions: []
  }

  for (const sourceBill of sourceBills) {
    const newData = await ReissueBillService.go(sourceBill, reissueBillRun)

    _addNewDataToDataToPersist(dataToPersist, newData)
  }

  await _persistData(dataToPersist)

  return true
}

// Adds the data held in each key of `newData` to the corresponding keys in `dataToPersist`
function _addNewDataToDataToPersist (dataToPersist, newData) {
  dataToPersist.bills.push(...newData.bills)
  dataToPersist.billLicences.push(...newData.billLicences)
  dataToPersist.transactions.push(...newData.transactions)
}

async function _persistData (dataToPersist) {
  await BillModel.query().insert(dataToPersist.bills)
  await BillLicenceModel.query().insert(dataToPersist.billLicences)
  await TransactionModel.query().insert(dataToPersist.transactions)
}

module.exports = {
  go
}
