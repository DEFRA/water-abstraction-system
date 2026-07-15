// Test helpers
import BillHelper from '../support/helpers/bill.helper.js'
import BillLicenceHelper from '../support/helpers/bill-licence.helper.js'
import BillModel from '../../app/models/bill.model.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'
import TransactionModel from '../../app/models/transaction.model.js'

// Thing under test
import BillLicenceModel from '../../app/models/bill-licence.model.js'

describe('Bill Licence model', () => {
  let testBill
  let testLicence
  let testRecord
  let testTransactions

  beforeAll(async () => {
    // Link bills
    testBill = await BillHelper.add()

    // Linking licences
    testLicence = await LicenceHelper.add()

    // Test record
    testRecord = await BillLicenceHelper.add({ billId: testBill.id, licenceId: testLicence.id })
    const { id } = testRecord

    // Link transactions
    testTransactions = []
    for (let i = 0; i < 2; i++) {
      const transaction = await TransactionHelper.add({ billLicenceId: id })

      testTransactions.push(transaction)
    }
  })

  afterAll(async () => {
    await testBill.$query().delete()
    await testLicence.$query().delete()

    for (const transaction of testTransactions) {
      await transaction.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillLicenceModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(BillLicenceModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query().innerJoinRelated('bill')

        expect(query).toBeDefined()
      })

      it('can eager load the bill', async () => {
        const result = await BillLicenceModel.query().findById(testRecord.id).withGraphFetched('bill')

        expect(result).toBeInstanceOf(BillLicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.bill).toBeInstanceOf(BillModel)
        expect(result.bill).toEqual(testBill)
      })
    })

    describe('when linking to transactions', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query().innerJoinRelated('transactions')

        expect(query).toBeDefined()
      })

      it('can eager load the transactions', async () => {
        const result = await BillLicenceModel.query().findById(testRecord.id).withGraphFetched('transactions')

        expect(result).toBeInstanceOf(BillLicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.transactions).toBeInstanceOf(Array)
        expect(result.transactions[0]).toBeInstanceOf(TransactionModel)
        expect(result.transactions).toContainEqual(testTransactions[0])
        expect(result.transactions).toContainEqual(testTransactions[1])
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await BillLicenceModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(BillLicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })
  })
})
