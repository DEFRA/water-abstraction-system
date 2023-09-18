'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../app/models/water/bill.model.js')
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')
const TransactionModel = require('../../../app/models/water/transaction.model.js')

// Thing under test
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')

describe('Bill Licence model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await BillLicenceHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillLicenceModel.query().findById(testRecord.billingInvoiceLicenceId)

      expect(result).to.be.an.instanceOf(BillLicenceModel)
      expect(result.billingInvoiceLicenceId).to.equal(testRecord.billingInvoiceLicenceId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill', () => {
      let testBill

      beforeEach(async () => {
        testBill = await BillHelper.add()

        const { billingInvoiceId } = testBill
        testRecord = await BillLicenceHelper.add({ billingInvoiceId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query()
          .innerJoinRelated('bill')

        expect(query).to.exist()
      })

      it('can eager load the bill', async () => {
        const result = await BillLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('bill')

        expect(result).to.be.instanceOf(BillLicenceModel)
        expect(result.billingInvoiceLicenceId).to.equal(testRecord.billingInvoiceLicenceId)

        expect(result.bill).to.be.an.instanceOf(BillModel)
        expect(result.bill).to.equal(testBill)
      })
    })

    describe('when linking to transactions', () => {
      let testTransactions

      beforeEach(async () => {
        testRecord = await BillLicenceHelper.add()
        const { billingInvoiceLicenceId } = testRecord

        testTransactions = []
        for (let i = 0; i < 2; i++) {
          const transaction = await TransactionHelper.add({ billingInvoiceLicenceId })
          testTransactions.push(transaction)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query()
          .innerJoinRelated('transactions')

        expect(query).to.exist()
      })

      it('can eager load the transactions', async () => {
        const result = await BillLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('transactions')

        expect(result).to.be.instanceOf(BillLicenceModel)
        expect(result.billingInvoiceLicenceId).to.equal(testRecord.billingInvoiceLicenceId)

        expect(result.transactions).to.be.an.array()
        expect(result.transactions[0]).to.be.an.instanceOf(TransactionModel)
        expect(result.transactions).to.include(testTransactions[0])
        expect(result.transactions).to.include(testTransactions[1])
      })
    })

    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceId } = testLicence
        testRecord = await BillLicenceHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await BillLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(BillLicenceModel)
        expect(result.billingInvoiceLicenceId).to.equal(testRecord.billingInvoiceLicenceId)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
