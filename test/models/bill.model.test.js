'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const BillHelper = require('../support/helpers/bill.helper.js')
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../app/models/billing-account.model.js')
const BillRunModel = require('../../app/models/bill-run.model.js')
const BillLicenceHelper = require('../support/helpers/bill-licence.helper.js')
const BillLicenceModel = require('../../app/models/bill-licence.model.js')
const BillRunHelper = require('../support/helpers/bill-run.helper.js')

// Thing under test
const BillModel = require('../../app/models/bill.model.js')

describe('Bill model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account', () => {
      let testBillingAccount

      beforeEach(async () => {
        testBillingAccount = await BillingAccountHelper.add()

        const { id: billingAccountId } = testBillingAccount

        testRecord = await BillHelper.add({ billingAccountId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillModel.query()
          .innerJoinRelated('billingAccount')

        expect(query).to.exist()
      })

      it('can eager load the billing account', async () => {
        const result = await BillModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccount')

        expect(result).to.be.instanceOf(BillModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccount).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccount).to.equal(testBillingAccount)
      })
    })

    describe('when linking to bill run', () => {
      let testBillRun

      beforeEach(async () => {
        testBillRun = await BillRunHelper.add()
        testRecord = await BillHelper.add({ billRunId: testBillRun.id })
      })

      it('can successfully run a related query', async () => {
        const query = await BillModel.query()
          .innerJoinRelated('billRun')

        expect(query).to.exist()
      })

      it('can eager load the bill run', async () => {
        const result = await BillModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billRun')

        expect(result).to.be.instanceOf(BillModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRun).to.be.an.instanceOf(BillRunModel)
        expect(result.billRun).to.equal(testBillRun)
      })
    })

    describe('when linking to bill licences', () => {
      let testBillLicences

      beforeEach(async () => {
        testRecord = await BillHelper.add()
        const { id } = testRecord

        testBillLicences = []
        for (let i = 0; i < 2; i++) {
          const billLicence = await BillLicenceHelper.add({ billId: id })

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
          .findById(testRecord.id)
          .withGraphFetched('billLicences')

        expect(result).to.be.instanceOf(BillModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billLicences).to.be.an.array()
        expect(result.billLicences[0]).to.be.an.instanceOf(BillLicenceModel)
        expect(result.billLicences).to.include(testBillLicences[0])
        expect(result.billLicences).to.include(testBillLicences[1])
      })
    })
  })
})
