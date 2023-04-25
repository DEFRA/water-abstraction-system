'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingInvoiceLicenceModel = require('../../../app/models/water/billing-invoice-licence.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const BillingInvoiceModel = require('../../../app/models/water/billing-invoice.model.js')

describe('Billing Invoice model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillingInvoiceHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillingInvoiceModel.query().findById(testRecord.billingInvoiceId)

      expect(result).to.be.an.instanceOf(BillingInvoiceModel)
      expect(result.billingInvoiceId).to.equal(testRecord.billingInvoiceId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing batch', () => {
      let testBillingBatch

      beforeEach(async () => {
        testBillingBatch = await BillingBatchHelper.add()
        testRecord = await BillingInvoiceHelper.add({}, { billingBatchId: testBillingBatch.billingBatchId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingInvoiceModel.query()
          .innerJoinRelated('billingBatch')

        expect(query).to.exist()
      })

      it('can eager load the billing batch', async () => {
        const result = await BillingInvoiceModel.query()
          .findById(testRecord.billingInvoiceId)
          .withGraphFetched('billingBatch')

        expect(result).to.be.instanceOf(BillingInvoiceModel)
        expect(result.billingInvoiceId).to.equal(testRecord.billingInvoiceId)

        expect(result.billingBatch).to.be.an.instanceOf(BillingBatchModel)
        expect(result.billingBatch).to.equal(testBillingBatch)
      })
    })

    describe('when linking to billing invoice licences', () => {
      let testBillingInvoiceLicences

      beforeEach(async () => {
        testRecord = await BillingInvoiceHelper.add()
        const { billingInvoiceId } = testRecord

        testBillingInvoiceLicences = []
        for (let i = 0; i < 2; i++) {
          const billingInvoiceLicence = await BillingInvoiceLicenceHelper.add({ billingInvoiceId })
          testBillingInvoiceLicences.push(billingInvoiceLicence)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await BillingInvoiceModel.query()
          .innerJoinRelated('billingInvoiceLicences')

        expect(query).to.exist()
      })

      it('can eager load the billing invoice licences', async () => {
        const result = await BillingInvoiceModel.query()
          .findById(testRecord.billingInvoiceId)
          .withGraphFetched('billingInvoiceLicences')

        expect(result).to.be.instanceOf(BillingInvoiceModel)
        expect(result.billingInvoiceId).to.equal(testRecord.billingInvoiceId)

        expect(result.billingInvoiceLicences).to.be.an.array()
        expect(result.billingInvoiceLicences[0]).to.be.an.instanceOf(BillingInvoiceLicenceModel)
        expect(result.billingInvoiceLicences).to.include(testBillingInvoiceLicences[0])
        expect(result.billingInvoiceLicences).to.include(testBillingInvoiceLicences[1])
      })
    })
  })
})
