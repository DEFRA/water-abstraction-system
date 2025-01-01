'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const BillHelper = require('../support/helpers/bill.helper.js')
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../app/models/billing-account.model.js')
const BillRunModel = require('../../app/models/bill-run.model.js')
const BillLicenceHelper = require('../support/helpers/bill-licence.helper.js')
const BillLicenceModel = require('../../app/models/bill-licence.model.js')
const BillRunHelper = require('../support/helpers/bill-run.helper.js')
const { closeConnection } = require('../support/database.js')

// Thing under test
const BillModel = require('../../app/models/bill.model.js')

describe('Bill model', () => {
  let testBillingAccount
  let testBillLicences
  let testBillRun
  let testRecord

  before(async () => {
    // Link bill runs
    testBillRun = await BillRunHelper.add()
    const { id: billRunId } = testBillRun

    // Link billing accounts
    testBillingAccount = await BillingAccountHelper.add()
    const { id: billingAccountId } = testBillingAccount

    // Test record
    testRecord = await BillHelper.add({ billingAccountId, billRunId })
    const { id } = testRecord

    // Link bill licences
    testBillLicences = []
    for (let i = 0; i < 2; i++) {
      const billLicence = await BillLicenceHelper.add({ billId: id })

      testBillLicences.push(billLicence)
    }
  })

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account', () => {
      it('can successfully run a related query', async () => {
        const query = await BillModel.query().innerJoinRelated('billingAccount')

        expect(query).to.exist()
      })

      it('can eager load the billing account', async () => {
        const result = await BillModel.query().findById(testRecord.id).withGraphFetched('billingAccount')

        expect(result).to.be.instanceOf(BillModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccount).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccount).to.equal(testBillingAccount)
      })
    })

    describe('when linking to bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await BillModel.query().innerJoinRelated('billRun')

        expect(query).to.exist()
      })

      it('can eager load the bill run', async () => {
        const result = await BillModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).to.be.instanceOf(BillModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRun).to.be.an.instanceOf(BillRunModel)
        expect(result.billRun).to.equal(testBillRun)
      })
    })

    describe('when linking to bill licences', () => {
      it('can successfully run a related query', async () => {
        const query = await BillModel.query().innerJoinRelated('billLicences')

        expect(query).to.exist()
      })

      it('can eager load the bill licences', async () => {
        const result = await BillModel.query().findById(testRecord.id).withGraphFetched('billLicences')

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
