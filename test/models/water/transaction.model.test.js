'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')

// Thing under test
const TransactionModel = require('../../../app/models/water/transaction.model.js')

describe('Billing Transaction model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await TransactionHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await TransactionModel.query().findById(testRecord.billingTransactionId)

      expect(result).to.be.an.instanceOf(TransactionModel)
      expect(result.billingTransactionId).to.equal(testRecord.billingTransactionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill licence', () => {
      let testBillLicence

      beforeEach(async () => {
        testBillLicence = await BillLicenceHelper.add()

        const { billingInvoiceLicenceId } = testBillLicence
        testRecord = await TransactionHelper.add({ billingInvoiceLicenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await TransactionModel.query()
          .innerJoinRelated('billLicence')

        expect(query).to.exist()
      })

      it('can eager load the bill licence', async () => {
        const result = await TransactionModel.query()
          .findById(testRecord.billingTransactionId)
          .withGraphFetched('billLicence')

        expect(result).to.be.instanceOf(TransactionModel)
        expect(result.billingTransactionId).to.equal(testRecord.billingTransactionId)

        expect(result.billLicence).to.be.an.instanceOf(BillLicenceModel)
        expect(result.billLicence).to.equal(testBillLicence)
      })
    })

    describe('when linking to charge element', () => {
      let testChargeElement

      beforeEach(async () => {
        testChargeElement = await ChargeElementHelper.add()

        const { chargeElementId } = testChargeElement
        testRecord = await TransactionHelper.add({ chargeElementId })
      })

      it('can successfully run a related query', async () => {
        const query = await TransactionModel.query()
          .innerJoinRelated('chargeElement')

        expect(query).to.exist()
      })

      it('can eager load the charge element', async () => {
        const result = await TransactionModel.query()
          .findById(testRecord.billingTransactionId)
          .withGraphFetched('chargeElement')

        expect(result).to.be.instanceOf(TransactionModel)
        expect(result.billingTransactionId).to.equal(testRecord.billingTransactionId)

        expect(result.chargeElement).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElement).to.equal(testChargeElement)
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
      ).to.not.reject()
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

      expect(objectResult.purposes).to.equal([{ test: 'TEST' }])
      expect(stringifyResult.purposes).to.equal([{ test: 'TEST' }])
    })
  })
})
