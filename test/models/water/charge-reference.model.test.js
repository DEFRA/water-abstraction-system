'use strict'

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
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')
const TransactionModel = require('../../../app/models/water/transaction.model.js')

// Thing under test
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')

describe('Charge Reference model', () => {
  let testBillRunVolumes
  let testChargeCategory
  let testChargeElements
  let testChargeVersion
  let testRecord
  let testTransactions

  beforeAll(async () => {
    testChargeCategory = await ChargeCategoryHelper.add()
    testChargeVersion = await ChargeVersionHelper.add()
    testBillRunVolumes = []
    testChargeElements = []
    testTransactions = []

    const { billingChargeCategoryId } = testChargeCategory
    const { chargeVersionId } = testChargeVersion
    testRecord = await ChargeReferenceHelper.add({ billingChargeCategoryId, chargeVersionId })

    const { chargeElementId } = testRecord

    for (let i = 0; i < 2; i++) {
      const billRunVolume = await BillRunVolumeHelper.add({ chargeElementId })
      testBillRunVolumes.push(billRunVolume)

      const chargeElement = await ChargeElementHelper.add({ description: `CP ${i}`, chargeElementId })
      testChargeElements.push(chargeElement)

      const transaction = await TransactionHelper.add({ description: `TEST TRANSACTION ${i}`, chargeElementId })
      testTransactions.push(transaction)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeReferenceModel.query().findById(testRecord.chargeElementId)

      expect(result).toBeInstanceOf(ChargeReferenceModel)
      expect(result.chargeElementId).toBe(testRecord.chargeElementId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run volumes', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('billRunVolumes')

        expect(query).toBeTruthy()
      })

      it('can eager load the bills', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('billRunVolumes')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).toBe(testRecord.chargeElementId)

        expect(result.billRunVolumes).toBeInstanceOf(Array)
        expect(result.billRunVolumes[0]).toBeInstanceOf(BillRunVolumeModel)
        expect(result.billRunVolumes).toContainEqual(testBillRunVolumes[0])
        expect(result.billRunVolumes).toContainEqual(testBillRunVolumes[1])
      })
    })

    describe('when linking to charge category', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('chargeCategory')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge category', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeCategory')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).toBe(testRecord.chargeElementId)

        expect(result.chargeCategory).toBeInstanceOf(ChargeCategoryModel)
        expect(result.chargeCategory).toEqual(testChargeCategory)
      })
    })

    describe('when linking to charge elements', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('chargeElements')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge elements', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeElements')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).toBe(testRecord.chargeElementId)

        expect(result.chargeElements).toBeInstanceOf(Array)
        expect(result.chargeElements[0]).toBeInstanceOf(ChargeElementModel)
        expect(result.chargeElements).toContainEqual(testChargeElements[0])
        expect(result.chargeElements).toContainEqual(testChargeElements[1])
      })
    })

    describe('when linking to transactions', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('transactions')

        expect(query).toBeTruthy()
      })

      it('can eager load the transactions', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('transactions')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).toBe(testRecord.chargeElementId)

        expect(result.transactions).toBeInstanceOf(Array)
        expect(result.transactions[0]).toBeInstanceOf(TransactionModel)
        expect(result.transactions).toContainEqual(testTransactions[0])
        expect(result.transactions).toContainEqual(testTransactions[1])
      })
    })

    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query()
          .innerJoinRelated('chargeVersion')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge version', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.chargeElementId)
          .withGraphFetched('chargeVersion')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeElementId).toBe(testRecord.chargeElementId)

        expect(result.chargeVersion).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersion).toEqual(testChargeVersion)
      })
    })
  })
})
