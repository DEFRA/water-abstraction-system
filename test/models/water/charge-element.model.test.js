'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const BillingChargeCategoryModel = require('../../../app/models/water/billing-charge-category.model.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')
const BillingTransactionModel = require('../../../app/models/water/billing-transaction.model.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const ChargePurposeModel = require('../../../app/models/water/charge-purpose.model.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const ChargeVersionModel = require('../../../app/models/water/charge-version.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')

describe('Charge Element model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ChargeElementHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeElementModel.query().findById(testRecord.chargeElementId)

      expect(result).to.be.an.instanceOf(ChargeElementModel)
      expect(result.chargeElementId).to.equal(testRecord.chargeElementId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing charge category', () => {
      let testBillingChargeCategory

      beforeEach(async () => {
        testBillingChargeCategory = await BillingChargeCategoryHelper.add()

        const { billingChargeCategoryId } = testBillingChargeCategory
        testRecord = await ChargeElementHelper.add({ billingChargeCategoryId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('billingChargeCategory')

        expect(query).to.exist()
      })

      it('can eager load the billing charge category', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('billingChargeCategory')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.billingChargeCategory).to.be.an.instanceOf(BillingChargeCategoryModel)
        expect(result.billingChargeCategory).to.equal(testBillingChargeCategory)
      })
    })

    describe('when linking to charge purposes', () => {
      let testChargePurposes

      beforeEach(async () => {
        const { chargeElementId } = testRecord

        testChargePurposes = []
        for (let i = 0; i < 2; i++) {
          const chargePurpose = await ChargePurposeHelper.add({ description: `CP ${i}`, chargeElementId })
          testChargePurposes.push(chargePurpose)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('chargePurposes')

        expect(query).to.exist()
      })

      it('can eager load the charge purposes', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargePurposes')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.chargePurposes).to.be.an.array()
        expect(result.chargePurposes[0]).to.be.an.instanceOf(ChargePurposeModel)
        expect(result.chargePurposes).to.include(testChargePurposes[0])
        expect(result.chargePurposes).to.include(testChargePurposes[1])
      })
    })

    describe('when linking to billing transactions', () => {
      let testBillingTransactions

      beforeEach(async () => {
        const { chargeElementId } = testRecord

        testBillingTransactions = []
        for (let i = 0; i < 2; i++) {
          const billingTransaction = await BillingTransactionHelper.add({ description: `TEST BILLING TRANSACTION ${i}`, chargeElementId })
          testBillingTransactions.push(billingTransaction)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('billingTransactions')

        expect(query).to.exist()
      })

      it('can eager load the billing transactions', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('billingTransactions')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.billingTransactions).to.be.an.array()
        expect(result.billingTransactions[0]).to.be.an.instanceOf(BillingTransactionModel)
        expect(result.billingTransactions).to.include(testBillingTransactions[0])
        expect(result.billingTransactions).to.include(testBillingTransactions[1])
      })
    })

    describe('when linking to charge version', () => {
      let testChargeVersion

      beforeEach(async () => {
        testChargeVersion = await ChargeVersionHelper.add()

        const { chargeVersionId } = testChargeVersion
        testRecord = await ChargeElementHelper.add({ chargeVersionId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('chargeVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeVersion')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.chargeVersion).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersion).to.equal(testChargeVersion)
      })
    })
  })
})
