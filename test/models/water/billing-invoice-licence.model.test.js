'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../app/models/water/bill.model.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')
const BillingTransactionModel = require('../../../app/models/water/billing-transaction.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')

// Thing under test
const BillingInvoiceLicenceModel = require('../../../app/models/water/billing-invoice-licence.model.js')

describe('Billing Invoice Licence model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await BillingInvoiceLicenceHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillingInvoiceLicenceModel.query().findById(testRecord.billingInvoiceLicenceId)

      expect(result).to.be.an.instanceOf(BillingInvoiceLicenceModel)
      expect(result.billingInvoiceLicenceId).to.equal(testRecord.billingInvoiceLicenceId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill', () => {
      let testBill

      beforeEach(async () => {
        testBill = await BillHelper.add()

        const { billingInvoiceId } = testBill
        testRecord = await BillingInvoiceLicenceHelper.add({ billingInvoiceId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingInvoiceLicenceModel.query()
          .innerJoinRelated('bill')

        expect(query).to.exist()
      })

      it('can eager load the bill', async () => {
        const result = await BillingInvoiceLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('bill')

        expect(result).to.be.instanceOf(BillingInvoiceLicenceModel)
        expect(result.billingInvoiceLicenceId).to.equal(testRecord.billingInvoiceLicenceId)

        expect(result.bill).to.be.an.instanceOf(BillModel)
        expect(result.bill).to.equal(testBill)
      })
    })

    describe('when linking to billing transactions', () => {
      let testBillingTransactions

      beforeEach(async () => {
        testRecord = await BillingInvoiceLicenceHelper.add()
        const { billingInvoiceLicenceId } = testRecord

        testBillingTransactions = []
        for (let i = 0; i < 2; i++) {
          const billingTransaction = await BillingTransactionHelper.add({ billingInvoiceLicenceId })
          testBillingTransactions.push(billingTransaction)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await BillingInvoiceLicenceModel.query()
          .innerJoinRelated('billingTransactions')

        expect(query).to.exist()
      })

      it('can eager load the billing transactions', async () => {
        const result = await BillingInvoiceLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('billingTransactions')

        expect(result).to.be.instanceOf(BillingInvoiceLicenceModel)
        expect(result.billingInvoiceLicenceId).to.equal(testRecord.billingInvoiceLicenceId)

        expect(result.billingTransactions).to.be.an.array()
        expect(result.billingTransactions[0]).to.be.an.instanceOf(BillingTransactionModel)
        expect(result.billingTransactions).to.include(testBillingTransactions[0])
        expect(result.billingTransactions).to.include(testBillingTransactions[1])
      })
    })

    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceId } = testLicence
        testRecord = await BillingInvoiceLicenceHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingInvoiceLicenceModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await BillingInvoiceLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(BillingInvoiceLicenceModel)
        expect(result.billingInvoiceLicenceId).to.equal(testRecord.billingInvoiceLicenceId)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
