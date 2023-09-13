'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../../support/helpers/water/charge-category.helper.js')
const ChargeCategoryModel = require('../../../app/models/water/charge-category.model.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeInformationHelper = require('../../support/helpers/water/charge-information.helper.js')
const ChargeInformationModel = require('../../../app/models/water/charge-information.model.js')
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const ChargePurposeModel = require('../../../app/models/water/charge-purpose.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')
const TransactionModel = require('../../../app/models/water/transaction.model.js')

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
    describe('when linking to charge category', () => {
      let testChargeCategory

      beforeEach(async () => {
        testChargeCategory = await ChargeCategoryHelper.add()

        const { billingChargeCategoryId } = testChargeCategory
        testRecord = await ChargeElementHelper.add({ billingChargeCategoryId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('chargeCategory')

        expect(query).to.exist()
      })

      it('can eager load the charge category', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeCategory')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.chargeCategory).to.be.an.instanceOf(ChargeCategoryModel)
        expect(result.chargeCategory).to.equal(testChargeCategory)
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

    describe('when linking to transactions', () => {
      let testTransactions

      beforeEach(async () => {
        const { chargeElementId } = testRecord

        testTransactions = []
        for (let i = 0; i < 2; i++) {
          const transaction = await TransactionHelper.add({ description: `TEST TRANSACTION ${i}`, chargeElementId })
          testTransactions.push(transaction)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('transactions')

        expect(query).to.exist()
      })

      it('can eager load the transactions', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('transactions')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.transactions).to.be.an.array()
        expect(result.transactions[0]).to.be.an.instanceOf(TransactionModel)
        expect(result.transactions).to.include(testTransactions[0])
        expect(result.transactions).to.include(testTransactions[1])
      })
    })

    describe('when linking to charge information', () => {
      let testChargeInformation

      beforeEach(async () => {
        testChargeInformation = await ChargeInformationHelper.add()

        const { chargeVersionId } = testChargeInformation
        testRecord = await ChargeElementHelper.add({ chargeVersionId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('chargeInformation')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeInformation')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.chargeInformation).to.be.an.instanceOf(ChargeInformationModel)
        expect(result.chargeInformation).to.equal(testChargeInformation)
      })
    })
  })
})
