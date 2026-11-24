// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillHelper from 'water-abstraction-engine/test/helpers/bill.helper.js'
import BillLicenceHelper from 'water-abstraction-engine/test/helpers/bill-licence.helper.js'
import BillLicenceModel from 'water-abstraction-engine/models/bill-licence.model.js'
import BillModel from 'water-abstraction-engine/models/bill.model.js'
import TransactionHelper from 'water-abstraction-engine/test/helpers/transaction.helper.js'
import TransactionModel from 'water-abstraction-engine/models/transaction.model.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import PersistBillDataDal from '../../../../src/dal/bill-runs/annual/persist-bill-data.dal.js'

describe('Bill Runs - Annual - Persist Bill Data dal', () => {
  let bill
  let billLicences
  let transactions

  beforeEach(() => {
    bill = BillHelper.defaults({ id: generateUUID() })
    billLicences = [BillLicenceHelper.defaults({ billId: bill.id, id: generateUUID() })]
    transactions = [TransactionHelper.defaults({ billLicenceId: billLicences[0].id, id: generateUUID() })]
  })

  afterEach(async () => {
    await TransactionModel.query().deleteById(transactions[0].id)
    await BillLicenceModel.query().deleteById(billLicences[0].id)
    await BillModel.query().deleteById(bill.id)
  })

  describe('when called', () => {
    it('returns true', async () => {
      const result = await PersistBillDataDal(bill, billLicences, transactions)

      expect(result).toBe(true)
    })

    it('persists the bill, bill licences and transactions', async () => {
      await PersistBillDataDal(bill, billLicences, transactions)

      const result = await BillModel.query().findById(bill.id).withGraphFetched('billLicences.transactions')

      expect(result.id).toEqual(bill.id)
      expect(result.billLicences).toHaveLength(1)
      expect(result.billLicences[0].id).toEqual(billLicences[0].id)
      expect(result.billLicences[0].transactions).toHaveLength(1)
    })
  })
})
