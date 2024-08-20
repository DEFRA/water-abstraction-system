'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../app/models/billing-account.model.js')
const BillRunChargeVersionYearHelper = require('../support/helpers/bill-run-charge-version-year.helper.js')
const BillRunChargeVersionYearModel = require('../../app/models/bill-run-charge-version-year.model.js')
const ChangeReasonHelper = require('../support/helpers/change-reason.helper.js')
const ChangeReasonModel = require('../../app/models/change-reason.model.js')
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionNoteHelper = require('../support/helpers/charge-version-note.helper.js')
const ChargeVersionNoteModel = require('../../app/models/charge-version-note.model.js')
const { randomInteger } = require('../support/general.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ModLogHelper = require('../support/helpers/mod-log.helper.js')
const ModLogModel = require('../../app/models/mod-log.model.js')
const ReviewChargeVersionHelper = require('../support/helpers/review-charge-version.helper.js')
const ReviewChargeVersionModel = require('../../app/models/review-charge-version.model.js')

const CHANGE_REASON_NEW_LICENCE_PART_INDEX = 10

// Thing under test
const ChargeVersionModel = require('../../app/models/charge-version.model.js')

describe('Charge Version model', () => {
  let chargeVersionId
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ChargeVersionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChargeVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account', () => {
      let testBillingAccount

      beforeEach(async () => {
        testBillingAccount = await BillingAccountHelper.add()

        const { id: billingAccountId } = testBillingAccount

        testRecord = await ChargeVersionHelper.add({ billingAccountId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('billingAccount')

        expect(query).to.exist()
      })

      it('can eager load the billing account', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccount')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccount).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccount).to.equal(testBillingAccount)
      })
    })

    describe('when linking to bill run charge version years', () => {
      let testBillRunChargeVersionYears

      beforeEach(async () => {
        testRecord = await ChargeVersionHelper.add()

        testBillRunChargeVersionYears = []
        for (let i = 0; i < 2; i++) {
          const billRunChargeVersionYear = await BillRunChargeVersionYearHelper.add({ chargeVersionId: testRecord.id })

          testBillRunChargeVersionYears.push(billRunChargeVersionYear)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('billRunChargeVersionYears')

        expect(query).to.exist()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billRunChargeVersionYears')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRunChargeVersionYears).to.be.an.array()
        expect(result.billRunChargeVersionYears[0]).to.be.an.instanceOf(BillRunChargeVersionYearModel)
        expect(result.billRunChargeVersionYears).to.include(testBillRunChargeVersionYears[0])
        expect(result.billRunChargeVersionYears).to.include(testBillRunChargeVersionYears[1])
      })
    })

    describe('when linking to change reason', () => {
      let testChangeReason

      beforeEach(async () => {
        testChangeReason = ChangeReasonHelper.select(CHANGE_REASON_NEW_LICENCE_PART_INDEX)

        const { id: changeReasonId } = testChangeReason

        testRecord = await ChargeVersionHelper.add({ changeReasonId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('changeReason')

        expect(query).to.exist()
      })

      it('can eager load the change reason', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('changeReason')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.changeReason).to.be.an.instanceOf(ChangeReasonModel)
        expect(result.changeReason).to.equal(testChangeReason, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to charge references', () => {
      let testChargeReferences

      beforeEach(async () => {
        testRecord = await ChargeVersionHelper.add()

        testChargeReferences = []
        for (let i = 0; i < 2; i++) {
          const chargeReference = await ChargeReferenceHelper.add({ chargeVersionId: testRecord.id })

          testChargeReferences.push(chargeReference)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('chargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeReferences')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeReferences).to.be.an.array()
        expect(result.chargeReferences[0]).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).to.include(testChargeReferences[0])
        expect(result.chargeReferences).to.include(testChargeReferences[1])
      })
    })

    describe('when linking to charge version note', () => {
      let testNote

      beforeEach(async () => {
        testNote = await ChargeVersionNoteHelper.add()

        const { id: noteId } = testNote

        testRecord = await ChargeVersionHelper.add({ noteId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('chargeVersionNote')

        expect(query).to.exist()
      })

      it('can eager load the note', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeVersionNote')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersionNote).to.be.an.instanceOf(ChargeVersionNoteModel)
        expect(result.chargeVersionNote).to.equal(testNote)
      })
    })

    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { id: licenceId } = testLicence

        testRecord = await ChargeVersionHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to mod logs', () => {
      let testModLogs

      beforeEach(async () => {
        testRecord = await ChargeVersionHelper.add()

        testModLogs = []
        for (let i = 0; i < 2; i++) {
          const modLog = await ModLogHelper.add({
            chargeVersionId: testRecord.id, licenceRef: testRecord.licenceRef
          })

          testModLogs.push(modLog)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('modLogs')

        expect(query).to.exist()
      })

      it('can eager load the mod logs', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('modLogs')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.modLogs).to.be.an.array()
        expect(result.modLogs[0]).to.be.an.instanceOf(ModLogModel)
        expect(result.modLogs).to.include(testModLogs[0])
        expect(result.modLogs).to.include(testModLogs[1])
      })
    })

    describe('when linking to review charge versions', () => {
      let testReviewChargeVersions

      beforeEach(async () => {
        testRecord = await ChargeVersionHelper.add()

        testReviewChargeVersions = []
        for (let i = 0; i < 2; i++) {
          const reviewChargeVersion = await ReviewChargeVersionHelper.add({ chargeVersionId: testRecord.id })

          testReviewChargeVersions.push(reviewChargeVersion)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query()
          .innerJoinRelated('reviewChargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the review charge versions', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeVersions')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeVersions).to.be.an.array()
        expect(result.reviewChargeVersions[0]).to.be.an.instanceOf(ReviewChargeVersionModel)
        expect(result.reviewChargeVersions).to.include(testReviewChargeVersions[0])
        expect(result.reviewChargeVersions).to.include(testReviewChargeVersions[1])
      })
    })
  })

  describe('$createdAt', () => {
    beforeEach(async () => {
      const { id } = await ChargeVersionHelper.add()

      chargeVersionId = id
    })

    describe('when the charge version has no mod log history', () => {
      beforeEach(async () => {
        testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
      })

      it('returns the return version "created at" time stamp', () => {
        const result = testRecord.$createdAt()

        expect(result).to.equal(testRecord.createdAt)
      })
    })

    describe('when the return version has mod log history', () => {
      beforeEach(async () => {
        const regionCode = randomInteger(1, 9)
        const firstNaldId = randomInteger(100, 99998)

        await ModLogHelper.add({
          externalId: `${regionCode}:${firstNaldId}`, naldDate: new Date('2012-06-01'), chargeVersionId
        })
        await ModLogHelper.add({
          externalId: `${regionCode}:${firstNaldId + 1}`, naldDate: new Date('2012-06-02'), chargeVersionId
        })

        testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
      })

      it('returns the first mod log NALD date', () => {
        const result = testRecord.$createdAt()

        expect(result).to.equal(new Date('2012-06-01'))
      })
    })
  })
})
