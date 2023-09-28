'use strict'

// Test helpers
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../app/models/water/bill.model.js')
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')
const TransactionModel = require('../../../app/models/water/transaction.model.js')

// Thing under test
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')

describe('Bill Licence model', () => {
  let testBill
  let testLicence
  let testRecord
  let testTransactions

  beforeAll(async () => {
    testBill = await BillHelper.add()
    testLicence = await LicenceHelper.add()
    testTransactions = []

    const { billingInvoiceId } = testBill
    const { licenceId } = testLicence
    testRecord = await BillLicenceHelper.add({ billingInvoiceId, licenceId })

    const { billingInvoiceLicenceId } = testRecord

    for (let i = 0; i < 2; i++) {
      const transaction = await TransactionHelper.add({ billingInvoiceLicenceId })
      testTransactions.push(transaction)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillLicenceModel.query().findById(testRecord.billingInvoiceLicenceId)

      expect(result).toBeInstanceOf(BillLicenceModel)
      expect(result.billingInvoiceLicenceId).toBe(testRecord.billingInvoiceLicenceId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query()
          .innerJoinRelated('bill')

        expect(query).toBeTruthy()
      })

      it('can eager load the bill', async () => {
        const result = await BillLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('bill')

        expect(result).toBeInstanceOf(BillLicenceModel)
        expect(result.billingInvoiceLicenceId).toBe(testRecord.billingInvoiceLicenceId)

        expect(result.bill).toBeInstanceOf(BillModel)
        expect(result.bill).toEqual(testBill)
      })
    })

    describe('when linking to transactions', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query()
          .innerJoinRelated('transactions')

        expect(query).toBeTruthy()
      })

      it('can eager load the transactions', async () => {
        const result = await BillLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('transactions')

        expect(result).toBeInstanceOf(BillLicenceModel)
        expect(result.billingInvoiceLicenceId).toBe(testRecord.billingInvoiceLicenceId)

        expect(result.transactions).toBeInstanceOf(Array)
        expect(result.transactions[0]).toBeInstanceOf(TransactionModel)
        expect(result.transactions).toContainEqual(testTransactions[0])
        expect(result.transactions).toContainEqual(testTransactions[1])
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query()
          .innerJoinRelated('licence')

        expect(query).toBeTruthy()
      })

      it('can eager load the licence', async () => {
        const result = await BillLicenceModel.query()
          .findById(testRecord.billingInvoiceLicenceId)
          .withGraphFetched('licence')

        expect(result).toBeInstanceOf(BillLicenceModel)
        expect(result.billingInvoiceLicenceId).toBe(testRecord.billingInvoiceLicenceId)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })
  })
})
