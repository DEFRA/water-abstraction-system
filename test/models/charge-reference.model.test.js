'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

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

  before(async () => {
    // Link purpose
    testPurpose = PurposeHelper.select()
    const { id: purposeId } = testPurpose

    // Link charge version
    testChargeVersion = await ChargeVersionHelper.add()
    const { id: chargeVersionId } = testChargeVersion

    // Link charge category
    testChargeCategory = ChargeCategoryHelper.select()
    const { id: chargeCategoryId } = testChargeCategory

    // Test record
    testRecord = await ChargeReferenceHelper.add({ chargeCategoryId, chargeVersionId, purposeId })
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

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeReferenceModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChargeReferenceModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run volumes', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('billRunVolumes')

        expect(query).to.exist()
      })

      it('can eager load the bills', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('billRunVolumes')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRunVolumes).to.be.an.array()
        expect(result.billRunVolumes[0]).to.be.an.instanceOf(BillRunVolumeModel)
        expect(result.billRunVolumes).to.include(testBillRunVolumes[0])
        expect(result.billRunVolumes).to.include(testBillRunVolumes[1])
      })
    })

    describe('when linking to charge category', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('chargeCategory')

        expect(query).to.exist()
      })

      it('can eager load the charge category', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('chargeCategory')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeCategory).to.be.an.instanceOf(ChargeCategoryModel)
        expect(result.chargeCategory).to.include(testChargeCategory)
      })
    })

    describe('when linking to charge elements', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('chargeElements')

        expect(query).to.exist()
      })

      it('can eager load the charge elements', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('chargeElements')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeElements).to.be.an.array()
        expect(result.chargeElements[0]).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElements).to.include(testChargeElements[0])
        expect(result.chargeElements).to.include(testChargeElements[1])
      })
    })

    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('chargeVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('chargeVersion')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersion).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersion).to.equal(testChargeVersion)
      })
    })

    describe('when linking to purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('purpose')

        expect(query).to.exist()
      })

      it('can eager load the purpose', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('purpose')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.chargePurposeId).to.equal(testRecord.chargePurposeId)

        expect(result.purpose).to.be.an.instanceOf(PurposeModel)
        expect(result.purpose).to.equal(testPurpose, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to review charge references', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('reviewChargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the review charge references', async () => {
        const result = await ChargeReferenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeReferences')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeReferences).to.be.an.array()
        expect(result.reviewChargeReferences[0]).to.be.an.instanceOf(ReviewChargeReferenceModel)
        expect(result.reviewChargeReferences).to.include(testReviewChargeReferences[0])
        expect(result.reviewChargeReferences).to.include(testReviewChargeReferences[1])
      })
    })

    describe('when linking to transactions', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeReferenceModel.query().innerJoinRelated('transactions')

        expect(query).to.exist()
      })

      it('can eager load the transactions', async () => {
        const result = await ChargeReferenceModel.query().findById(testRecord.id).withGraphFetched('transactions')

        expect(result).to.be.instanceOf(ChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.transactions).to.be.an.array()
        expect(result.transactions[0]).to.be.an.instanceOf(TransactionModel)
        expect(result.transactions).to.include(testTransactions[0])
        expect(result.transactions).to.include(testTransactions[1])
      })
    })
  })
})
