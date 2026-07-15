// Test helpers
import BillLicenceHelper from '../support/helpers/bill-licence.helper.js'
import BillLicenceModel from '../../app/models/bill-licence.model.js'
import ChargeReferenceHelper from '../support/helpers/charge-reference.helper.js'
import ChargeReferenceModel from '../../app/models/charge-reference.model.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'

// Thing under test
import TransactionModel from '../../app/models/transaction.model.js'

describe('Transaction model', () => {
  let testBillLicence
  let testChargeReference
  let testRecord

  beforeAll(async () => {
    testBillLicence = await BillLicenceHelper.add()
    testChargeReference = await ChargeReferenceHelper.add()

    testRecord = await TransactionHelper.add({
      billLicenceId: testBillLicence.id,
      chargeReferenceId: testChargeReference.id
    })
  })

  afterAll(async () => {
    await testBillLicence.$query().delete()
    await testChargeReference.$query().delete()
    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await TransactionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(TransactionModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill licence', () => {
      it('can successfully run a related query', async () => {
        const query = await TransactionModel.query().innerJoinRelated('billLicence')

        expect(query).toBeDefined()
      })

      it('can eager load the bill licence', async () => {
        const result = await TransactionModel.query().findById(testRecord.id).withGraphFetched('billLicence')

        expect(result).toBeInstanceOf(TransactionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billLicence).toBeInstanceOf(BillLicenceModel)
        expect(result.billLicence).toEqual(testBillLicence)
      })
    })

    describe('when linking to charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await TransactionModel.query().innerJoinRelated('chargeReference')

        expect(query).toBeDefined()
      })

      it('can eager load the charge reference', async () => {
        const result = await TransactionModel.query().findById(testRecord.id).withGraphFetched('chargeReference')

        expect(result).toBeInstanceOf(TransactionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeReference).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReference).toEqual(testChargeReference)
      })
    })
  })

  describe('Inserting', () => {
    // Objection doesn't normally allow us to insert an object directly into a json field unless we stringify it first.
    // However if we define jsonAttributes in our model with the json fields then we don't need to stringify the object.
    // This test is therefore to check whether jsonAttributes is correctly working.
    it('can insert an object directly into a json field', async () => {
      await expect(
        TransactionModel.query().insert({
          ...TransactionHelper.defaults(),
          purposes: [{ test: 'TEST' }]
        })
      ).resolves.toBeDefined()
    })

    it('returns an object from a json field regardless of whether the inserted object was stringified first', async () => {
      const objectTransaction = await TransactionModel.query().insert({
        ...TransactionHelper.defaults(),
        purposes: [{ test: 'TEST' }]
      })
      const stringifyTransaction = await TransactionModel.query().insert({
        ...TransactionHelper.defaults(),
        purposes: JSON.stringify([{ test: 'TEST' }])
      })

      const objectResult = await TransactionModel.query().findById(objectTransaction.id)
      const stringifyResult = await TransactionModel.query().findById(stringifyTransaction.id)

      expect(objectResult.purposes).toEqual([{ test: 'TEST' }])
      expect(stringifyResult.purposes).toEqual([{ test: 'TEST' }])
    })
  })
})
