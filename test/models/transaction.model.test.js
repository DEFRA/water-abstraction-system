'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillLicenceModel = require('../../app/models/bill-licence.model.js')
const BillLicenceHelper = require('../support/helpers/bill-licence.helper.js')
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')
const TransactionHelper = require('../support/helpers/transaction.helper.js')

// Thing under test
const TransactionModel = require('../../app/models/transaction.model.js')

describe('Transaction model', () => {
  let testBillLicence
  let testChargeReference
  let testRecord

  before(async () => {
    testBillLicence = await BillLicenceHelper.add()
    testChargeReference = await ChargeReferenceHelper.add()

    testRecord = await TransactionHelper.add({
      billLicenceId: testBillLicence.id,
      chargeReferenceId: testChargeReference.id
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await TransactionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(TransactionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill licence', () => {
      it('can successfully run a related query', async () => {
        const query = await TransactionModel.query().innerJoinRelated('billLicence')

        expect(query).to.exist()
      })

      it('can eager load the bill licence', async () => {
        const result = await TransactionModel.query().findById(testRecord.id).withGraphFetched('billLicence')

        expect(result).to.be.instanceOf(TransactionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billLicence).to.be.an.instanceOf(BillLicenceModel)
        expect(result.billLicence).to.equal(testBillLicence)
      })
    })

    describe('when linking to charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await TransactionModel.query().innerJoinRelated('chargeReference')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await TransactionModel.query().findById(testRecord.id).withGraphFetched('chargeReference')

        expect(result).to.be.instanceOf(TransactionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeReference).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReference).to.equal(testChargeReference)
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

      const objectResult = await TransactionModel.query().findById(objectTransaction.id)
      const stringifyResult = await TransactionModel.query().findById(stringifyTransaction.id)

      expect(objectResult.purposes).to.equal([{ test: 'TEST' }])
      expect(stringifyResult.purposes).to.equal([{ test: 'TEST' }])
    })
  })
})
