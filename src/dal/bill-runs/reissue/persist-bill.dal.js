/**
 * Persists the data for a reissued bill
 * @module PersistBillDal
 */

import BillLicenceModel from 'water-abstraction-engine/models/bill-licence.model.js'
import BillModel from 'water-abstraction-engine/models/bill.model.js'
import TransactionModel from 'water-abstraction-engine/models/transaction.model.js'

/**
 * Persists the data for a reissued bill
 *
 * @param {object} dataToPersist - The data to persist, containing bills, billLicences and transactions
 */
export default async function persistBillDal(dataToPersist) {
  await BillModel.query().insert(dataToPersist.bills)
  await BillLicenceModel.query().insert(dataToPersist.billLicences)
  await TransactionModel.query().insert(dataToPersist.transactions)
}
