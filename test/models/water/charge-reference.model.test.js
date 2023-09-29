'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunVolumeHelper = require('../../support/helpers/water/bill-run-volume.helper.js')
const BillRunVolumeModel = require('../../../app/models/water/bill-run-volume.model.js')
const ChargeCategoryHelper = require('../../support/helpers/water/charge-category.helper.js')
const ChargeCategoryModel = require('../../../app/models/water/charge-category.model.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const ChargeVersionModel = require('../../../app/models/water/charge-version.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')
const TransactionModel = require('../../../app/models/water/transaction.model.js')

// Thing under test
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')

describe('Charge Reference model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ChargeReferenceHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeReferenceModel.query().findById(testRecord.chargeElementId)

      expect(result).to.be.an.instanceOf(ChargeReferenceModel)
      expect(result.chargeElementId).to.equal(testRecord.chargeElementId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run volumes', () => {
      let testBillRunVolumes

      beforeEach(async () => {
        testRecord = await ChargeReferenceHelper.add()
        const { chargeElementId } = testRecord

        testBillRunVolumes = []
        for (let i = 0; i < 2; i++) {
          const billRunVolume = await BillRunVolumeHelper.add({ chargeElementId })
          testBillRunVolumes.push(billRunVolume)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('billRunVolumes')

        expect(query).to.exist()
      })

      it('can eager load the bills', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('billRunVolumes')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.billRunVolumes).to.be.an.array()
        expect(result.billRunVolumes[0]).to.be.an.instanceOf(BillRunVolumeModel)
        expect(result.billRunVolumes).to.include(testBillRunVolumes[0])
        expect(result.billRunVolumes).to.include(testBillRunVolumes[1])
      })
    })

    describe('when linking to charge category', () => {
      let testChargeCategory

      beforeEach(async () => {
        testChargeCategory = await ChargeCategoryHelper.add()

        const { billingChargeCategoryId } = testChargeCategory
        testRecord = await ChargeReferenceHelper.add({ billingChargeCategoryId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('chargeCategory')

        expect(query).to.exist()
      })

      it('can eager load the charge category', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeCategory')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.chargeCategory).to.be.an.instanceOf(ChargeCategoryModel)
        expect(result.chargeCategory).to.equal(testChargeCategory)
      })
    })

    describe('when linking to charge elements', () => {
      let testChargeElements

      beforeEach(async () => {
        const { chargeElementId } = testRecord

        testChargeElements = []
        for (let i = 0; i < 2; i++) {
          const chargeElement = await ChargeElementHelper.add({ description: `CP ${i}`, chargeElementId })
          testChargeElements.push(chargeElement)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('chargeElements')

        expect(query).to.exist()
      })

      it('can eager load the charge elements', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeElements')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.chargeElements).to.be.an.array()
        expect(result.chargeElements[0]).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElements).to.include(testChargeElements[0])
        expect(result.chargeElements).to.include(testChargeElements[1])
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
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('transactions')

        expect(query).to.exist()
      })

      it('can eager load the transactions', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('transactions')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.transactions).to.be.an.array()
        expect(result.transactions[0]).to.be.an.instanceOf(TransactionModel)
        expect(result.transactions).to.include(testTransactions[0])
        expect(result.transactions).to.include(testTransactions[1])
      })
    })

    describe('when linking to charge version', () => {
      let testChargeVersion

      beforeEach(async () => {
        testChargeVersion = await ChargeVersionHelper.add()

        const { chargeVersionId } = testChargeVersion
        testRecord = await ChargeReferenceHelper.add({ chargeVersionId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('chargeVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeVersion')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).to.equal(testRecord.chargeElementId)

        expect(result.chargeVersion).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersion).to.equal(testChargeVersion)
      })
    })
  })
})
