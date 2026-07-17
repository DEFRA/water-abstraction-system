// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillRunChargeVersionYearHelper from '../support/helpers/bill-run-charge-version-year.helper.js'
import BillRunChargeVersionYearModel from '../../app/models/bill-run-charge-version-year.model.js'
import BillingAccountHelper from '../support/helpers/billing-account.helper.js'
import BillingAccountModel from '../../app/models/billing-account.model.js'
import ChangeReasonHelper from '../support/helpers/change-reason.helper.js'
import ChangeReasonModel from '../../app/models/change-reason.model.js'
import ChargeReferenceHelper from '../support/helpers/charge-reference.helper.js'
import ChargeReferenceModel from '../../app/models/charge-reference.model.js'
import ChargeVersionHelper from '../support/helpers/charge-version.helper.js'
import ChargeVersionNoteHelper from '../support/helpers/charge-version-note.helper.js'
import ChargeVersionNoteModel from '../../app/models/charge-version-note.model.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import ModLogHelper from '../support/helpers/mod-log.helper.js'
import ModLogModel from '../../app/models/mod-log.model.js'
import ReviewChargeVersionHelper from '../support/helpers/review-charge-version.helper.js'
import ReviewChargeVersionModel from '../../app/models/review-charge-version.model.js'
import UserHelper from '../support/helpers/user.helper.js'
import { generateRandomInteger } from '../support/generators.js'

// Thing under test
import ChargeVersionModel from '../../app/models/charge-version.model.js'

const CHANGE_REASON_NEW_LICENCE_PART_INDEX = 10

describe('Charge Version model', () => {
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

  beforeAll(async () => {
    // Link billing account
    testBillingAccount = await BillingAccountHelper.add()

    // Link change reason
    testChangeReason = ChangeReasonHelper.select(CHANGE_REASON_NEW_LICENCE_PART_INDEX)

    // Link charge version note
    testNote = await ChargeVersionNoteHelper.add()

    // Link licence
    testLicence = await LicenceHelper.add()

    // Test record
    testRecord = await ChargeVersionHelper.add({
      billingAccountId: testBillingAccount.id,
      changeReasonId: testChangeReason.id,
      noteId: testNote.id,
      licenceId: testLicence.id
    })

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

  afterAll(async () => {
    for (const billRunChargeVersionYear of testBillRunChargeVersionYears) {
      await billRunChargeVersionYear.$query().delete()
    }

    for (const chargeReference of testChargeReferences) {
      await chargeReference.$query().delete()
    }

    for (const modLog of testModLogs) {
      await modLog.$query().delete()
    }

    for (const reviewChargeVersion of testReviewChargeVersions) {
      await reviewChargeVersion.$query().delete()
    }

    // NOTE: Must delete parent record before child records
    await testRecord.$query().delete()

    await testBillingAccount.$query().delete()
    await testNote.$query().delete()
    await testLicence.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ChargeVersionModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('billingAccount')

        expect(query).toBeDefined()
      })

      it('can eager load the billing account', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('billingAccount')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billingAccount).toBeInstanceOf(BillingAccountModel)
        expect(result.billingAccount).toEqual(testBillingAccount)
      })
    })

    describe('when linking to bill run charge version years', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('billRunChargeVersionYears')

        expect(query).toBeDefined()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billRunChargeVersionYears')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRunChargeVersionYears).toBeInstanceOf(Array)
        expect(result.billRunChargeVersionYears[0]).toBeInstanceOf(BillRunChargeVersionYearModel)
        expect(result.billRunChargeVersionYears).toContainEqual(testBillRunChargeVersionYears[0])
        expect(result.billRunChargeVersionYears).toContainEqual(testBillRunChargeVersionYears[1])
      })
    })

    describe('when linking to change reason', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('changeReason')

        expect(query).toBeDefined()
      })

      it('can eager load the change reason', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('changeReason')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.changeReason).toBeInstanceOf(ChangeReasonModel)
        expect(result.changeReason).toMatchObject(testChangeReason)
      })
    })

    describe('when linking to charge references', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('chargeReferences')

        expect(query).toBeDefined()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('chargeReferences')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeReferences).toBeInstanceOf(Array)
        expect(result.chargeReferences[0]).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).toContainEqual(testChargeReferences[0])
        expect(result.chargeReferences).toContainEqual(testChargeReferences[1])
      })
    })

    describe('when linking to charge version note', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('chargeVersionNote')

        expect(query).toBeDefined()
      })

      it('can eager load the note', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('chargeVersionNote')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersionNote).toBeInstanceOf(ChargeVersionNoteModel)
        expect(result.chargeVersionNote).toEqual(testNote)
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to mod logs', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('modLogs')

        expect(query).toBeDefined()
      })

      it('can eager load the mod logs', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('modLogs')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.modLogs).toBeInstanceOf(Array)
        expect(result.modLogs[0]).toBeInstanceOf(ModLogModel)
        expect(result.modLogs).toContainEqual(testModLogs[0])
        expect(result.modLogs).toContainEqual(testModLogs[1])
      })
    })

    describe('when linking to review charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionModel.query().innerJoinRelated('reviewChargeVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge versions', async () => {
        const result = await ChargeVersionModel.query().findById(testRecord.id).withGraphFetched('reviewChargeVersions')

        expect(result).toBeInstanceOf(ChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeVersions).toBeInstanceOf(Array)
        expect(result.reviewChargeVersions[0]).toBeInstanceOf(ReviewChargeVersionModel)
        expect(result.reviewChargeVersions).toContainEqual(testReviewChargeVersions[0])
        expect(result.reviewChargeVersions).toContainEqual(testReviewChargeVersions[1])
      })
    })
  })

  describe('$createdAt', () => {
    let fetchedRecord
    let createdAtTestRecord
    let createdAtModLogs

    beforeEach(async () => {
      createdAtTestRecord = await ChargeVersionHelper.add()

      createdAtModLogs = []
    })

    afterEach(async () => {
      for (const modLog of createdAtModLogs) {
        await modLog.$query().delete()
      }

      await createdAtTestRecord.$query().delete()
    })

    describe('when the charge version has no mod log history', () => {
      beforeEach(async () => {
        fetchedRecord = await ChargeVersionModel.query()
          .select(['licenceId'])
          .findById(createdAtTestRecord.id)
          .modify('history')
      })

      it('returns the charge version "created at" time stamp', () => {
        const result = fetchedRecord.$createdAt()

        expect(result).toEqual(fetchedRecord.createdAt)
      })
    })

    describe('when the charge version has mod log history', () => {
      beforeEach(async () => {
        const regionCode = generateRandomInteger(1, 9)
        const firstNaldId = generateRandomInteger(100, 99998)

        createdAtModLogs.push(
          await ModLogHelper.add({
            externalId: `${regionCode}:${firstNaldId}`,
            naldDate: new Date('2012-06-01'),
            chargeVersionId: createdAtTestRecord.id
          })
        )
        createdAtModLogs.push(
          await ModLogHelper.add({
            externalId: `${regionCode}:${firstNaldId + 1}`,
            naldDate: new Date('2012-06-02'),
            chargeVersionId: createdAtTestRecord.id
          })
        )

        fetchedRecord = await ChargeVersionModel.query().findById(createdAtTestRecord.id).modify('history')
      })

      it('returns the first mod log NALD date', () => {
        const result = fetchedRecord.$createdAt()

        expect(result).toEqual(new Date('2012-06-01'))
      })
    })
  })

  describe('$createdBy', () => {
    let fetchedRecord
    let createdByModLogs
    let createdByTestRecord

    beforeEach(() => {
      createdByModLogs = []
    })

    afterEach(async () => {
      for (const modLog of createdByModLogs) {
        await modLog.$query().delete()
      }

      await createdByTestRecord.$query().delete()
    })

    describe('when the charge version was created in WRLS', () => {
      beforeEach(async () => {
        testUser = UserHelper.select()

        createdByTestRecord = await ChargeVersionHelper.add({
          source: 'wrls',
          createdBy: { id: testUser.id, email: testUser.username }
        })
      })

      describe('and it has no mod log history', () => {
        beforeEach(async () => {
          fetchedRecord = await ChargeVersionModel.query().findById(createdByTestRecord.id).modify('history')
        })

        it('returns the WRLS user name', () => {
          const result = fetchedRecord.$createdBy()

          expect(result).toEqual(testUser.username)
        })
      })

      describe('though it has mod log history', () => {
        beforeEach(async () => {
          createdByModLogs.push(await ModLogHelper.add({ chargeVersionId: createdByTestRecord.id }))

          fetchedRecord = await ChargeVersionModel.query().findById(createdByTestRecord.id).modify('history')
        })

        it('still returns the WRLS user name', () => {
          const result = fetchedRecord.$createdBy()

          expect(result).toEqual(testUser.username)
        })
      })
    })

    describe('when the charge version was created in NALD', () => {
      beforeEach(async () => {
        createdByTestRecord = await ChargeVersionHelper.add({ source: 'nald' })
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          fetchedRecord = await ChargeVersionModel.query().findById(createdByTestRecord.id).modify('history')
        })

        it('returns null', () => {
          const result = fetchedRecord.$createdBy()

          expect(result).toBeNull()
        })
      })

      describe('and has mod log history', () => {
        beforeEach(async () => {
          const regionCode = generateRandomInteger(1, 9)
          const firstNaldId = generateRandomInteger(100, 99998)

          createdByModLogs.push(
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              chargeVersionId: createdByTestRecord.id,
              userId: 'FIRST'
            })
          )
          createdByModLogs.push(
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              chargeVersionId: createdByTestRecord.id,
              userId: 'SECOND'
            })
          )

          fetchedRecord = await ChargeVersionModel.query().findById(createdByTestRecord.id).modify('history')
        })

        it('returns the first mod log NALD user ID', () => {
          const result = fetchedRecord.$createdBy()

          expect(result).toEqual('FIRST')
        })
      })
    })
  })

  describe('$notes', () => {
    let fetchedRecord
    let notesChargeVersionNote
    let notesModLogs
    let notesTestRecord

    beforeEach(() => {
      notesModLogs = []
    })

    afterEach(async () => {
      if (notesChargeVersionNote) {
        await notesChargeVersionNote.$query().delete()
      }

      for (const modLog of notesModLogs) {
        await modLog.$query().delete()
      }

      await notesTestRecord.$query().delete()
    })

    describe('when the charge version was created in WRLS', () => {
      describe('but no note was added', () => {
        beforeEach(async () => {
          notesTestRecord = await ChargeVersionHelper.add({ source: 'wrls' })

          fetchedRecord = await ChargeVersionModel.query().findById(notesTestRecord.id).modify('history')
        })

        it('returns an empty array', () => {
          const result = fetchedRecord.$notes()

          expect(result).toBeInstanceOf(Array)
          expect(result).toHaveLength(0)
        })
      })

      describe('and a note was added', () => {
        beforeEach(async () => {
          notesChargeVersionNote = await ChargeVersionNoteHelper.add({ note: 'Top site bore hole' })
          notesTestRecord = await ChargeVersionHelper.add({ noteId: notesChargeVersionNote.id, source: 'nald' })

          fetchedRecord = await ChargeVersionModel.query().findById(notesTestRecord.id).modify('history')
        })

        it('returns an array containing just the single note', () => {
          const result = fetchedRecord.$notes()

          expect(result).toEqual(['Top site bore hole'])
        })
      })
    })

    describe('when the charge version was created in NALD', () => {
      beforeEach(async () => {
        notesTestRecord = await ChargeVersionHelper.add({ source: 'nald' })
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          fetchedRecord = await ChargeVersionModel.query().findById(notesTestRecord.id).modify('history')
        })

        it('returns an empty array', () => {
          const result = fetchedRecord.$notes()

          expect(result).toBeInstanceOf(Array)
          expect(result).toHaveLength(0)
        })
      })

      describe('and has mod log history', () => {
        describe('but none of the mod log history has notes', () => {
          beforeEach(async () => {
            const regionCode = generateRandomInteger(1, 9)
            const firstNaldId = generateRandomInteger(100, 99998)

            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                note: null,
                chargeVersionId: notesTestRecord.id
              })
            )
            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                note: null,
                chargeVersionId: notesTestRecord.id
              })
            )

            fetchedRecord = await ChargeVersionModel.query().findById(notesTestRecord.id).modify('history')
          })

          it('returns an empty array', () => {
            const result = fetchedRecord.$notes()

            expect(result).toBeInstanceOf(Array)
            expect(result).toHaveLength(0)
          })
        })

        describe('and some of the mod log history has notes', () => {
          beforeEach(async () => {
            const regionCode = generateRandomInteger(1, 9)
            const firstNaldId = generateRandomInteger(100, 99998)

            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                note: null,
                chargeVersionId: notesTestRecord.id
              })
            )
            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                note: 'Transfer per app 12-DEF',
                chargeVersionId: notesTestRecord.id
              })
            )

            fetchedRecord = await ChargeVersionModel.query().findById(notesTestRecord.id).modify('history')
          })

          it('returns an array containing just the notes from the mod logs with them', () => {
            const result = fetchedRecord.$notes()

            expect(result).toEqual(['Transfer per app 12-DEF'])
          })
        })
      })
    })
  })

  describe('$reason', () => {
    let fetchedRecord
    let reasonModLogs
    let reasonTestRecord

    beforeEach(() => {
      reasonModLogs = []
    })

    afterEach(async () => {
      for (const modLog of reasonModLogs) {
        await modLog.$query().delete()
      }

      await reasonTestRecord.$query().delete()
    })

    describe('when the charge version was created in WRLS', () => {
      beforeEach(async () => {
        reasonTestRecord = await ChargeVersionHelper.add({ changeReasonId: testChangeReason.id, source: 'wrls' })

        fetchedRecord = await ChargeVersionModel.query().findById(reasonTestRecord.id).modify('history')
      })

      it('returns the charge version reason', () => {
        const result = fetchedRecord.$reason()

        expect(result).toEqual(testChangeReason.description)
      })
    })

    describe('when the charge version was created in NALD', () => {
      beforeEach(async () => {
        reasonTestRecord = await ChargeVersionHelper.add({ source: 'nald' })
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          fetchedRecord = await ChargeVersionModel.query().findById(reasonTestRecord.id).modify('history')
        })

        it('returns null', () => {
          const result = fetchedRecord.$reason()

          expect(result).toBeNull()
        })
      })

      describe('and has mod log history', () => {
        describe('but the mod log history has no reason description recorded in the first entry', () => {
          beforeEach(async () => {
            const regionCode = generateRandomInteger(1, 9)
            const firstNaldId = generateRandomInteger(100, 99998)

            reasonModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                reasonDescription: null,
                chargeVersionId: reasonTestRecord.id
              })
            )
            reasonModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                reasonDescription: 'Transferred',
                chargeVersionId: reasonTestRecord.id
              })
            )

            fetchedRecord = await ChargeVersionModel.query().findById(reasonTestRecord.id).modify('history')
          })

          it('returns null', () => {
            const result = fetchedRecord.$reason()

            expect(result).toBeNull()
          })
        })
      })

      describe('and the mod log history has a reason description recorded in the first entry', () => {
        beforeEach(async () => {
          const regionCode = generateRandomInteger(1, 9)
          const firstNaldId = generateRandomInteger(100, 99998)

          reasonModLogs.push(
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              reasonDescription: 'Formal Variation',
              chargeVersionId: reasonTestRecord.id
            })
          )
          reasonModLogs.push(
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              reasonDescription: 'Transferred',
              chargeVersionId: reasonTestRecord.id
            })
          )

          fetchedRecord = await ChargeVersionModel.query().findById(reasonTestRecord.id).modify('history')
        })

        it('returns the NALD reason description', () => {
          const result = fetchedRecord.$reason()

          expect(result).toEqual('Formal Variation')
        })
      })
    })
  })
})
