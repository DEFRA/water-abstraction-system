'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingInvoiceLicenceModel = require('../../../app/models/water/billing-invoice-licence.model.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const BillingTransactionModel = require('../../../app/models/water/billing-transaction.model.js')

describe('Billing Transaction model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await BillingTransactionHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillingTransactionModel.query().findById(testRecord.billingTransactionId)

      expect(result).to.be.an.instanceOf(BillingTransactionModel)
      expect(result.billingTransactionId).to.equal(testRecord.billingTransactionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing invoice licence', () => {
      let testBillingInvoiceLicence

      beforeEach(async () => {
        testBillingInvoiceLicence = await BillingInvoiceLicenceHelper.add()

        const { billingInvoiceLicenceId } = testBillingInvoiceLicence
        testRecord = await BillingTransactionHelper.add({ billingInvoiceLicenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingTransactionModel.query()
          .innerJoinRelated('billingInvoiceLicence')

        expect(query).to.exist()
      })

      it('can eager load the billing invoice licence', async () => {
        const result = await BillingTransactionModel.query()
          .findById(testRecord.billingTransactionId)
          .withGraphFetched('billingInvoiceLicence')

        expect(result).to.be.instanceOf(BillingTransactionModel)
        expect(result.billingTransactionId).to.equal(testRecord.billingTransactionId)

        expect(result.billingInvoiceLicence).to.be.an.instanceOf(BillingInvoiceLicenceModel)
        expect(result.billingInvoiceLicence).to.equal(testBillingInvoiceLicence)
      })
    })

    describe('when linking to charge element', () => {
      let testChargeElement

      beforeEach(async () => {
        testChargeElement = await ChargeElementHelper.add()

        const { chargeElementId } = testChargeElement
        testRecord = await BillingTransactionHelper.add({ chargeElementId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingTransactionModel.query()
          .innerJoinRelated('chargeElement')

        expect(query).to.exist()
      })

      it('can eager load the charge element', async () => {
        const result = await BillingTransactionModel.query()
          .findById(testRecord.billingTransactionId)
          .withGraphFetched('chargeElement')

        expect(result).to.be.instanceOf(BillingTransactionModel)
        expect(result.billingTransactionId).to.equal(testRecord.billingTransactionId)

        expect(result.chargeElement).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElement).to.equal(testChargeElement)
      })
    })
  })

  describe('Inserting', () => {
    // Objection doesn't normally allow us to insert an object directly into a json field unless we stringify it first.
    // However if we define jsonAttributes in our model with the json fields then we don't need to stringify the object.
    // This test is therefore to check whether jsonAttributes is correctly working.
    it('can insert an object directly into a json field', async () => {
      await expect(
        BillingTransactionModel.query().insert({
          ...BillingTransactionHelper.defaults(),
          purposes: [{ test: 'TEST' }]
        })
      ).to.not.reject()
    })
  })
})
