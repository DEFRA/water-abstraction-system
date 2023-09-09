'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingInvoiceLicenceModel = require('../../../app/models/water/billing-invoice-licence.model.js')
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const BillModel = require('../../../app/models/water/bill.model.js')

describe('Bill model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillModel.query().findById(testRecord.billingInvoiceId)

      expect(result).to.be.an.instanceOf(BillModel)
      expect(result.billingInvoiceId).to.equal(testRecord.billingInvoiceId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run', () => {
      let testBillRun

      beforeEach(async () => {
        testBillRun = await BillRunHelper.add()
        testRecord = await BillHelper.add({ billingBatchId: testBillRun.billingBatchId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillModel.query()
          .innerJoinRelated('billRun')

        expect(query).to.exist()
      })

      it('can eager load the bill run', async () => {
        const result = await BillModel.query()
          .findById(testRecord.billingInvoiceId)
          .withGraphFetched('billRun')

        expect(result).to.be.instanceOf(BillModel)
        expect(result.billingInvoiceId).to.equal(testRecord.billingInvoiceId)

        expect(result.billRun).to.be.an.instanceOf(BillRunModel)
        expect(result.billRun).to.equal(testBillRun)
      })
    })

    describe('when linking to billing invoice licences', () => {
      let testBillingInvoiceLicences

      beforeEach(async () => {
        testRecord = await BillHelper.add()
        const { billingInvoiceId } = testRecord

        testBillingInvoiceLicences = []
        for (let i = 0; i < 2; i++) {
          const billingInvoiceLicence = await BillingInvoiceLicenceHelper.add({ billingInvoiceId })
          testBillingInvoiceLicences.push(billingInvoiceLicence)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await BillModel.query()
          .innerJoinRelated('billingInvoiceLicences')

        expect(query).to.exist()
      })

      it('can eager load the billing invoice licences', async () => {
        const result = await BillModel.query()
          .findById(testRecord.billingInvoiceId)
          .withGraphFetched('billingInvoiceLicences')

        expect(result).to.be.instanceOf(BillModel)
        expect(result.billingInvoiceId).to.equal(testRecord.billingInvoiceId)

        expect(result.billingInvoiceLicences).to.be.an.array()
        expect(result.billingInvoiceLicences[0]).to.be.an.instanceOf(BillingInvoiceLicenceModel)
        expect(result.billingInvoiceLicences).to.include(testBillingInvoiceLicences[0])
        expect(result.billingInvoiceLicences).to.include(testBillingInvoiceLicences[1])
      })
    })
  })
})
