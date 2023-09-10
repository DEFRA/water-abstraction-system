'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')
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

    describe('when linking to bill licences', () => {
      let testBillLicences

      beforeEach(async () => {
        testRecord = await BillHelper.add()
        const { billingInvoiceId } = testRecord

        testBillLicences = []
        for (let i = 0; i < 2; i++) {
          const billLicence = await BillLicenceHelper.add({ billingInvoiceId })
          testBillLicences.push(billLicence)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await BillModel.query()
          .innerJoinRelated('billLicences')

        expect(query).to.exist()
      })

      it('can eager load the bill licences', async () => {
        const result = await BillModel.query()
          .findById(testRecord.billingInvoiceId)
          .withGraphFetched('billLicences')

        expect(result).to.be.instanceOf(BillModel)
        expect(result.billingInvoiceId).to.equal(testRecord.billingInvoiceId)

        expect(result.billLicences).to.be.an.array()
        expect(result.billLicences[0]).to.be.an.instanceOf(BillLicenceModel)
        expect(result.billLicences).to.include(testBillLicences[0])
        expect(result.billLicences).to.include(testBillLicences[1])
      })
    })
  })
})
