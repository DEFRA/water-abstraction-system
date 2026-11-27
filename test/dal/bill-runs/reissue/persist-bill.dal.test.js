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
import PersistBillDal from '../../../../src/dal/bill-runs/reissue/persist-bill.dal.js'

describe('Bill Runs - Reissue - Persist Bill dal', () => {
  let dataToPersist

  beforeEach(() => {
    dataToPersist = { billLicences: [], bills: [], transactions: [] }

    for (let i = 0; i < 3; i++) {
      const bill = BillHelper.defaults({ id: generateUUID() })
      const billLicence = BillLicenceHelper.defaults({ billId: bill.id, id: generateUUID() })
      const transaction = TransactionHelper.defaults({ billLicenceId: billLicence.id, id: generateUUID() })

      dataToPersist.bills.push(bill)
      dataToPersist.billLicences.push(billLicence)
      dataToPersist.transactions.push(transaction)
    }
  })

  afterEach(async () => {
    await TransactionModel.query().delete().whereIn('id', _ids(dataToPersist.transactions))
    await BillLicenceModel.query().delete().whereIn('id', _ids(dataToPersist.billLicences))
    await BillModel.query().delete().whereIn('id', _ids(dataToPersist.bills))
  })

  describe('when called', () => {
    it('persists all bills', async () => {
      await PersistBillDal(dataToPersist)

      const result = await BillModel.query().whereIn('id', _ids(dataToPersist.bills))

      expect(result).toHaveLength(3)
    })

    it('persists all bill licences', async () => {
      await PersistBillDal(dataToPersist)

      const result = await BillLicenceModel.query().whereIn('id', _ids(dataToPersist.billLicences))

      expect(result).toHaveLength(3)
    })

    it('persists all transactions', async () => {
      await PersistBillDal(dataToPersist)

      const result = await TransactionModel.query().whereIn('id', _ids(dataToPersist.transactions))

      expect(result).toHaveLength(3)
    })
  })
})

function _ids(records) {
  return records.map((record) => {
    return record.id
  })
}
