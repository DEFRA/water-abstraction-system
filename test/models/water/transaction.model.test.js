'use strict'

// Test helpers
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')

// Thing under test
const TransactionModel = require('../../../app/models/water/transaction.model.js')

describe('Transaction model', () => {
  let testBillLicence
  let testChargeReference
  let testRecord

  beforeEach(async () => {
    testBillLicence = await BillLicenceHelper.add()
    testChargeReference = await ChargeReferenceHelper.add()

    const { billingInvoiceLicenceId } = testBillLicence
    const { chargeElementId } = testChargeReference
    testRecord = await TransactionHelper.add({ billingInvoiceLicenceId, chargeElementId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await TransactionModel.query().findById(testRecord.billingTransactionId)

      expect(result).toBeInstanceOf(TransactionModel)
      expect(result.billingTransactionId).toBe(testRecord.billingTransactionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill licence', () => {
      it('can successfully run a related query', async () => {
        const query = await TransactionModel.query()
          .innerJoinRelated('billLicence')

        expect(query).toBeTruthy()
      })

      it('can eager load the bill licence', async () => {
        const result = await TransactionModel.query()
          .findById(testRecord.billingTransactionId)
          .withGraphFetched('billLicence')

        expect(result).toBeInstanceOf(TransactionModel)
        expect(result.billingTransactionId).toBe(testRecord.billingTransactionId)

        expect(result.billLicence).toBeInstanceOf(BillLicenceModel)
        expect(result.billLicence).toEqual(testBillLicence)
      })
    })

    describe('when linking to charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await TransactionModel.query()
          .innerJoinRelated('chargeReference')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge reference', async () => {
        const result = await TransactionModel.query()
          .findById(testRecord.billingTransactionId)
          .withGraphFetched('chargeReference')

        expect(result).toBeInstanceOf(TransactionModel)
        expect(result.billingTransactionId).toBe(testRecord.billingTransactionId)

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
      ).resolves.not.toThrow()
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

      const objectResult = await TransactionModel.query().findById(objectTransaction.billingTransactionId)
      const stringifyResult = await TransactionModel.query().findById(stringifyTransaction.billingTransactionId)

      expect(objectResult.purposes).toEqual([{ test: 'TEST' }])
      expect(stringifyResult.purposes).toEqual([{ test: 'TEST' }])
    })
  })
})
