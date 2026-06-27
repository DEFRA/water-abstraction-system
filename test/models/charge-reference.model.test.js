'use strict'

// Test helpers
const BillRunVolumeHelper = require('../support/helpers/bill-run-volume.helper.js')
const BillRunVolumeModel = require('../../app/models/bill-run-volume.model.js')
const ChargeCategoryHelper = require('../support/helpers/charge-category.helper.js')
const ChargeCategoryModel = require('../../app/models/charge-category.model.js')
const ChargeElementHelper = require('../support/helpers/charge-element.helper.js')
const ChargeElementModel = require('../../app/models/charge-element.model.js')
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const ReviewChargeReferenceHelper = require('../support/helpers/review-charge-reference.helper.js')
const ReviewChargeReferenceModel = require('../../app/models/review-charge-reference.model.js')
const TransactionHelper = require('../support/helpers/transaction.helper.js')
const TransactionModel = require('../../app/models/transaction.model.js')

// Thing under test
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')

describe('Charge Reference model', () => {
  let testBillRunVolumes
  let testChargeCategory
  let testChargeElements
  let testChargeVersion
  let testRecord
  let testReviewChargeReferences
  let testPurpose
  let testTransactions

  beforeAll(async () => {
    // Link purpose
    testPurpose = PurposeHelper.select()

    // Link charge version
    testChargeVersion = await ChargeVersionHelper.add()

    // Link charge category
    testChargeCategory = ChargeCategoryHelper.select()

    // Test record
    testRecord = await ChargeReferenceHelper.add({
      chargeCategoryId: testChargeCategory.id,
      chargeVersionId: testChargeVersion.id,
      purposeId: testPurpose.id
    })
    const { id } = testRecord

    // Link bill run volumes
    testBillRunVolumes = []
    for (let i = 0; i < 2; i++) {
      const billRunVolume = await BillRunVolumeHelper.add({ chargeReferenceId: id })

      testBillRunVolumes.push(billRunVolume)
    }

    // Link charge elements
    testChargeElements = []
    for (let i = 0; i < 2; i++) {
      const chargeElement = await ChargeElementHelper.add({ chargeReferenceId: testRecord.id })

      testChargeElements.push(chargeElement)
    }

    // Link review charge references
    testReviewChargeReferences = []
    for (let i = 0; i < 2; i++) {
      const reviewChargeReference = await ReviewChargeReferenceHelper.add({ chargeReferenceId: testRecord.id })

      testReviewChargeReferences.push(reviewChargeReference)
    }

    // Link transactions
    testTransactions = []
    for (let i = 0; i < 2; i++) {
      const transaction = await TransactionHelper.add({ chargeReferenceId: testRecord.id })

      testTransactions.push(transaction)
    }
  })

  afterAll(async () => {
    await testChargeVersion.$query().delete()

    for (const billRunVolume of testBillRunVolumes) {
      await billRunVolume.$query().delete()
    }

    for (const chargeElement of testChargeElements) {
      await chargeElement.$query().delete()
    }

    for (const reviewChargeReference of testReviewChargeReferences) {
      await reviewChargeReference.$query().delete()
    }

    for (const transaction of testTransactions) {
      await transaction.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeReferenceModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ChargeReferenceModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run volumes', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('billRunVolumes')

        expect(query).toBeDefined()
      })

      it('can eager load the bills', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('billRunVolumes')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRunVolumes).toBeInstanceOf(Array)
        expect(result.billRunVolumes[0]).toBeInstanceOf(BillRunVolumeModel)
        expect(result.billRunVolumes).toContainEqual(testBillRunVolumes[0])
        expect(result.billRunVolumes).toContainEqual(testBillRunVolumes[1])
      })
    })

    describe('when linking to charge category', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('chargeCategory')

        expect(query).toBeDefined()
      })

      it('can eager load the charge category', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('chargeCategory')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeCategory).toBeInstanceOf(ChargeCategoryModel)
        expect(result.chargeCategory).toMatchObject(testChargeCategory)
      })
    })

    describe('when linking to charge elements', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('chargeElements')

        expect(query).toBeDefined()
      })

      it('can eager load the charge elements', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('chargeElements')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeElements).toBeInstanceOf(Array)
        expect(result.chargeElements[0]).toBeInstanceOf(ChargeElementModel)
        expect(result.chargeElements).toContainEqual(testChargeElements[0])
        expect(result.chargeElements).toContainEqual(testChargeElements[1])
      })
    })

    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('chargeVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the charge version', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('chargeVersion')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersion).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersion).toEqual(testChargeVersion)
      })
    })

    describe('when linking to purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('purpose')

        expect(query).toBeDefined()
      })

      it('can eager load the purpose', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('purpose')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargePurposeId).toMatchObject(testRecord.chargePurposeId)

        expect(result.purpose).toBeInstanceOf(PurposeModel)
        expect(result.purpose).toMatchObject(testPurpose)
      })
    })

    describe('when linking to review charge references', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('reviewChargeReferences')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge references', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeReferences')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeReferences).toBeInstanceOf(Array)
        expect(result.reviewChargeReferences[0]).toBeInstanceOf(ReviewChargeReferenceModel)
        expect(result.reviewChargeReferences).toContainEqual(testReviewChargeReferences[0])
        expect(result.reviewChargeReferences).toContainEqual(testReviewChargeReferences[1])
      })
    })

    describe('when linking to transactions', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('transactions')

        expect(query).toBeDefined()
      })

      it('can eager load the transactions', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('transactions')

        expect(result).toBeInstanceOf(ChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.transactions).toBeInstanceOf(Array)
        expect(result.transactions[0]).toBeInstanceOf(TransactionModel)
        expect(result.transactions).toContainEqual(testTransactions[0])
        expect(result.transactions).toContainEqual(testTransactions[1])
      })
    })
  })
})
