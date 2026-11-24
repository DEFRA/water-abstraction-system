/**
 * Inserts the bill data for a billing account
 * @module PersistBillDataDal
 */

import BillLicenceModel from 'water-abstraction-engine/models/bill-licence.model.js'
import BillModel from 'water-abstraction-engine/models/bill.model.js'
import TransactionModel from 'water-abstraction-engine/models/transaction.model.js'

/**
 * Inserts the bill data for a billing account
 *
 * @param {object} bill - The bill to be created for the billing account
 * @param {object[]} billLicences - The bill licences linked to the bill, one for each licence that generated
 * transactions
 * @param {object[]} transactions - The transactions linked to the bill licences, which have been sent to the Charging
 * Module and updated with its response
 *
 * @returns {Promise<boolean>} Always true once the bill data has been persisted
 */
export default async function persistBillDataDal(bill, billLicences, transactions) {
  await BillModel.query().insert(bill)
  await BillLicenceModel.query().insert(billLicences)
  await TransactionModel.query().insert(transactions)

  return true
}
