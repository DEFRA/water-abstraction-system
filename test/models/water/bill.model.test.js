'use strict'

// Test helpers
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')

// Thing under test
const BillModel = require('../../../app/models/water/bill.model.js')

describe('Bill model', () => {
  let testBillLicences
  let testBillRun
  let testRecord

  beforeAll(async () => {
    testBillLicences = []
    testBillRun = await BillRunHelper.add()
    testRecord = await BillHelper.add({ billingBatchId: testBillRun.billingBatchId })

    const { billingInvoiceId } = testRecord

    for (let i = 0; i < 2; i++) {
      const billLicence = await BillLicenceHelper.add({ billingInvoiceId })
      testBillLicences.push(billLicence)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillModel.query().findById(testRecord.billingInvoiceId)

      expect(result).toBeInstanceOf(BillModel)
      expect(result.billingInvoiceId).toBe(testRecord.billingInvoiceId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await BillModel.query()
          .innerJoinRelated('billRun')

        expect(query).toBeTruthy()
      })

      it('can eager load the bill run', async () => {
        const result = await BillModel.query()
          .findById(testRecord.billingInvoiceId)
          .withGraphFetched('billRun')

        expect(result).toBeInstanceOf(BillModel)
        expect(result.billingInvoiceId).toBe(testRecord.billingInvoiceId)

        expect(result.billRun).toBeInstanceOf(BillRunModel)
        expect(result.billRun).toEqual(testBillRun)
      })
    })

    describe('when linking to bill licences', () => {
      it('can successfully run a related query', async () => {
        const query = await BillModel.query()
          .innerJoinRelated('billLicences')

        expect(query).toBeTruthy()
      })

      it('can eager load the bill licences', async () => {
        const result = await BillModel.query()
          .findById(testRecord.billingInvoiceId)
          .withGraphFetched('billLicences')

        expect(result).toBeInstanceOf(BillModel)
        expect(result.billingInvoiceId).toBe(testRecord.billingInvoiceId)

        expect(result.billLicences).toBeInstanceOf(Array)
        expect(result.billLicences[0]).toBeInstanceOf(BillLicenceModel)
        expect(result.billLicences).toContainEqual(testBillLicences[0])
        expect(result.billLicences).toContainEqual(testBillLicences[1])
      })
    })
  })
})
