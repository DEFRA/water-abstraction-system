'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
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
const UserHelper = require('../support/helpers/user.helper.js')

const CHANGE_REASON_NEW_LICENCE_PART_INDEX = 10

// Thing under test
const ChargeVersionModel = require('../../app/models/charge-version.model.js')

describe('Charge Version model', () => {
  let chargeVersionId
  let testBillingAccount
  let testBillRunChargeVersionYears
  let testChangeReason
  let testChargeReferences
  let testLicence
  let testModLogs
  let testNote
  let testRecord
  let testReviewChargeVersions
  let testUser

  before(async () => {
    // Link billing account
    testBillingAccount = await BillingAccountHelper.add()
    const { id: billingAccountId } = testBillingAccount

    // Link change reason
    testChangeReason = ChangeReasonHelper.select(CHANGE_REASON_NEW_LICENCE_PART_INDEX)
    const { id: changeReasonId } = testChangeReason

    // Link charge version note
    testNote = await ChargeVersionNoteHelper.add()
    const { id: noteId } = testNote

    // Link licence
    testLicence = await LicenceHelper.add()
    const { id: licenceId } = testLicence

    // Test record
    testRecord = await ChargeVersionHelper.add({ billingAccountId, changeReasonId, noteId, licenceId })

    // Link bill run charge version years
    testBillRunChargeVersionYears = []
    for (let i = 0; i < 2; i++) {
      const billRunChargeVersionYear = await BillRunChargeVersionYearHelper.add({ chargeVersionId: testRecord.id })

      testBillRunChargeVersionYears.push(billRunChargeVersionYear)
    }

    // Link charge references
    testChargeReferences = []
    for (let i = 0; i < 2; i++) {
      const chargeReference = await ChargeReferenceHelper.add({ chargeVersionId: testRecord.id })

      testChargeReferences.push(chargeReference)
    }

    // Link mod logs
    testModLogs = []
    for (let i = 0; i < 2; i++) {
      const modLog = await ModLogHelper.add({
        chargeVersionId: testRecord.id,
        licenceRef: testRecord.licenceRef
      })

      testModLogs.push(modLog)
    }

    // Link review charge versions
    testReviewChargeVersions = []
    for (let i = 0; i < 2; i++) {
      const reviewChargeVersion = await ReviewChargeVersionHelper.add({ chargeVersionId: testRecord.id })

      testReviewChargeVersions.push(reviewChargeVersion)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChargeVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('billingAccount')

        expect(query).to.exist()
      })

      it('can eager load the billing account', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('billingAccount')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccount).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccount).to.equal(testBillingAccount)
      })
    })

    describe('when linking to bill run charge version years', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('billRunChargeVersionYears')

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
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('changeReason')

        expect(query).to.exist()
      })

      it('can eager load the change reason', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('changeReason')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.changeReason).to.be.an.instanceOf(ChangeReasonModel)
        expect(result.changeReason).to.equal(testChangeReason, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to charge references', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('chargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('chargeReferences')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeReferences).to.be.an.array()
        expect(result.chargeReferences[0]).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).to.include(testChargeReferences[0])
        expect(result.chargeReferences).to.include(testChargeReferences[1])
      })
    })

    describe('when linking to charge version note', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('chargeVersionNote')

        expect(query).to.exist()
      })

      it('can eager load the note', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('chargeVersionNote')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersionNote).to.be.an.instanceOf(ChargeVersionNoteModel)
        expect(result.chargeVersionNote).to.equal(testNote)
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to mod logs', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('modLogs')

        expect(query).to.exist()
      })

      it('can eager load the mod logs', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('modLogs')

        expect(result).to.be.instanceOf(ChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.modLogs).to.be.an.array()
        expect(result.modLogs[0]).to.be.an.instanceOf(ModLogModel)
        expect(result.modLogs).to.include(testModLogs[0])
        expect(result.modLogs).to.include(testModLogs[1])
      })
    })

    describe('when linking to review charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('reviewChargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the review charge versions', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('reviewChargeVersions')

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
        testRecord = await ChargeVersionModel.query().select(['licenceId']).findById(chargeVersionId).modify('history')
      })

      it('returns the charge version "created at" time stamp', () => {
        const result = testRecord.$createdAt()

        expect(result).to.equal(testRecord.createdAt)
      })
    })

    describe('when the charge version has mod log history', () => {
      beforeEach(async () => {
        const regionCode = randomInteger(1, 9)
        const firstNaldId = randomInteger(100, 99998)

        await ModLogHelper.add({
          externalId: `${regionCode}:${firstNaldId}`,
          naldDate: new Date('2012-06-01'),
          chargeVersionId
        })
        await ModLogHelper.add({
          externalId: `${regionCode}:${firstNaldId + 1}`,
          naldDate: new Date('2012-06-02'),
          chargeVersionId
        })

        testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
      })

      it('returns the first mod log NALD date', () => {
        const result = testRecord.$createdAt()

        expect(result).to.equal(new Date('2012-06-01'))
      })
    })
  })

  describe('$createdBy', () => {
    describe('when the charge version was created in WRLS', () => {
      beforeEach(async () => {
        testUser = UserHelper.select()

        const { id } = await ChargeVersionHelper.add({
          source: 'wrls',
          createdBy: { id: testUser.id, email: testUser.username }
        })

        chargeVersionId = id
      })

      describe('and it has no mod log history', () => {
        beforeEach(async () => {
          testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
        })

        it('returns the WRLS user name', () => {
          const result = testRecord.$createdBy()

          expect(result).to.equal(testUser.username)
        })
      })

      describe('though it has mod log history', () => {
        beforeEach(async () => {
          await ModLogHelper.add({ chargeVersionId })

          testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
        })

        it('still returns the WRLS user name', () => {
          const result = testRecord.$createdBy()

          expect(result).to.equal(testUser.username)
        })
      })
    })

    describe('when the charge version was created in NALD', () => {
      beforeEach(async () => {
        const { id } = await ChargeVersionHelper.add({ source: 'nald' })

        chargeVersionId = id
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
        })

        it('returns null', () => {
          const result = testRecord.$createdBy()

          expect(result).to.be.null()
        })
      })

      describe('and has mod log history', () => {
        beforeEach(async () => {
          const regionCode = randomInteger(1, 9)
          const firstNaldId = randomInteger(100, 99998)

          await ModLogHelper.add({ externalId: `${regionCode}:${firstNaldId}`, chargeVersionId, userId: 'FIRST' })
          await ModLogHelper.add({ externalId: `${regionCode}:${firstNaldId + 1}`, chargeVersionId, userId: 'SECOND' })

          testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
        })

        it('returns the first mod log NALD user ID', () => {
          const result = testRecord.$createdBy()

          expect(result).to.equal('FIRST')
        })
      })
    })
  })

  describe('$notes', () => {
    describe('when the charge version was created in WRLS', () => {
      describe('but no note was added', () => {
        beforeEach(async () => {
          const { id } = await ChargeVersionHelper.add({ source: 'wrls' })

          testRecord = await ChargeVersionModel.query().findById(id).modify('history')
        })

        it('returns an empty array', () => {
          const result = testRecord.$notes()

          expect(result).to.be.an.array()
          expect(result).to.be.empty()
        })
      })

      describe('and a note was added', () => {
        beforeEach(async () => {
          const { id: noteId } = await ChargeVersionNoteHelper.add({ note: 'Top site bore hole' })
          const { id } = await ChargeVersionHelper.add({ noteId, source: 'nald' })

          testRecord = await ChargeVersionModel.query().findById(id).modify('history')
        })

        it('returns an array containing just the single note', () => {
          const result = testRecord.$notes()

          expect(result).to.equal(['Top site bore hole'])
        })
      })
    })

    describe('when the charge version was created in NALD', () => {
      beforeEach(async () => {
        const { id } = await ChargeVersionHelper.add({ source: 'nald' })

        chargeVersionId = id
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
        })

        it('returns an empty array', () => {
          const result = testRecord.$notes()

          expect(result).to.be.an.array()
          expect(result).to.be.empty()
        })
      })

      describe('and has mod log history', () => {
        describe('but none of the mod log history has notes', () => {
          beforeEach(async () => {
            const regionCode = randomInteger(1, 9)
            const firstNaldId = randomInteger(100, 99998)

            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              note: null,
              chargeVersionId
            })
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              note: null,
              chargeVersionId
            })

            testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
          })

          it('returns an empty array', () => {
            const result = testRecord.$notes()

            expect(result).to.be.an.array()
            expect(result).to.be.empty()
          })
        })

        describe('and some of the mod log history has notes', () => {
          beforeEach(async () => {
            const regionCode = randomInteger(1, 9)
            const firstNaldId = randomInteger(100, 99998)

            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              note: null,
              chargeVersionId
            })
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              note: 'Transfer per app 12-DEF',
              chargeVersionId
            })

            testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
          })

          it('returns an array containing just the notes from the mod logs with them', () => {
            const result = testRecord.$notes()

            expect(result).to.equal(['Transfer per app 12-DEF'])
          })
        })
      })
    })
  })

  describe('$reason', () => {
    describe('when the charge version was created in WRLS', () => {
      beforeEach(async () => {
        const { id } = await ChargeVersionHelper.add({ changeReasonId: testChangeReason.id, source: 'wrls' })

        testRecord = await ChargeVersionModel.query().findById(id).modify('history')
      })

      it('returns the charge version reason', () => {
        const result = testRecord.$reason()

        expect(result).to.equal(testChangeReason.description)
      })
    })

    describe('when the charge version was created in NALD', () => {
      beforeEach(async () => {
        const { id } = await ChargeVersionHelper.add({ source: 'nald' })

        chargeVersionId = id
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
        })

        it('returns null', () => {
          const result = testRecord.$reason()

          expect(result).to.be.null()
        })
      })

      describe('and has mod log history', () => {
        describe('but the mod log history has no reason description recorded in the first entry', () => {
          beforeEach(async () => {
            const regionCode = randomInteger(1, 9)
            const firstNaldId = randomInteger(100, 99998)

            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              reasonDescription: null,
              chargeVersionId
            })
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              reasonDescription: 'Transferred',
              chargeVersionId
            })

            testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
          })

          it('returns null', () => {
            const result = testRecord.$reason()

            expect(result).to.be.null()
          })
        })
      })

      describe('and the mod log history has a reason description recorded in the first entry', () => {
        beforeEach(async () => {
          const regionCode = randomInteger(1, 9)
          const firstNaldId = randomInteger(100, 99998)

          await ModLogHelper.add({
            externalId: `${regionCode}:${firstNaldId}`,
            reasonDescription: 'Formal Variation',
            chargeVersionId
          })
          await ModLogHelper.add({
            externalId: `${regionCode}:${firstNaldId + 1}`,
            reasonDescription: 'Transferred',
            chargeVersionId
          })

          testRecord = await ChargeVersionModel.query().findById(chargeVersionId).modify('history')
        })

        it('returns the NALD reason description', () => {
          const result = testRecord.$reason()

          expect(result).to.equal('Formal Variation')
        })
      })
    })
  })
})
