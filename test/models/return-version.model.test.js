// Test helpers
import * as LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import * as ModLogHelper from '../support/helpers/mod-log.helper.js'
import ModLogModel from '../../app/models/mod-log.model.js'
import * as ReturnRequirementHelper from '../support/helpers/return-requirement.helper.js'
import ReturnRequirementModel from '../../app/models/return-requirement.model.js'
import * as ReturnVersionHelper from '../support/helpers/return-version.helper.js'
import UserModel from '../../app/models/user.model.js'
import * as UserHelper from '../support/helpers/user.helper.js'
import { generateRandomInteger } from '../../app/lib/general.lib.js'
import { randomRegionCode } from '../support/general.js'

// Thing under test
import ReturnVersionModel from '../../app/models/return-version.model.js'

describe('Return Version model', () => {
  let testLicence
  let testModLogs
  let testRecord
  let testReturnRequirements
  let testUser

  beforeAll(async () => {
    testLicence = await LicenceHelper.add()

    testUser = UserHelper.select()

    testRecord = await ReturnVersionHelper.add({ createdBy: testUser.userId, licenceId: testLicence.id })

    testModLogs = []
    for (let i = 0; i < 2; i++) {
      const modLog = await ModLogHelper.add({ returnVersionId: testRecord.id })

      testModLogs.push(modLog)
    }

    testReturnRequirements = []
    for (let i = 0; i < 2; i++) {
      const returnRequirement = await ReturnRequirementHelper.add({
        siteDescription: `TEST RTN REQ ${i}`,
        returnVersionId: testRecord.id
      })

      testReturnRequirements.push(returnRequirement)
    }
  })

  afterAll(async () => {
    for (const modLog of testModLogs) {
      await modLog.$query().delete()
    }

    for (const returnRequirement of testReturnRequirements) {
      await returnRequirement.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnVersionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReturnVersionModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await ReturnVersionModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(ReturnVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to mod logs', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query().innerJoinRelated('modLogs')

        expect(query).toBeDefined()
      })

      it('can eager load the mod logs', async () => {
        const result = await ReturnVersionModel.query().findById(testRecord.id).withGraphFetched('modLogs')

        expect(result).toBeInstanceOf(ReturnVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.modLogs).toBeInstanceOf(Array)
        expect(result.modLogs[0]).toBeInstanceOf(ModLogModel)
        expect(result.modLogs).toContainEqual(testModLogs[0])
        expect(result.modLogs).toContainEqual(testModLogs[1])
      })
    })

    describe('when linking to return requirements', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query().innerJoinRelated('returnRequirements')

        expect(query).toBeDefined()
      })

      it('can eager load the return requirements', async () => {
        const result = await ReturnVersionModel.query().findById(testRecord.id).withGraphFetched('returnRequirements')

        expect(result).toBeInstanceOf(ReturnVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnRequirements).toBeInstanceOf(Array)
        expect(result.returnRequirements[0]).toBeInstanceOf(ReturnRequirementModel)
        expect(result.returnRequirements).toContainEqual(testReturnRequirements[0])
        expect(result.returnRequirements).toContainEqual(testReturnRequirements[1])
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query().innerJoinRelated('user')

        expect(query).toBeDefined()
      })

      it('can eager load the user', async () => {
        const result = await ReturnVersionModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).toBeInstanceOf(ReturnVersionModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.user).toBeInstanceOf(UserModel)
        expect(result.user).toMatchObject({ ...testUser, password: expect.any(String) })
      })
    })
  })

  describe('$createdAt', () => {
    let createdAtModLogs
    let createdAtTestRecord
    let fetchedRecord

    beforeEach(async () => {
      createdAtTestRecord = await ReturnVersionHelper.add()

      createdAtModLogs = []
    })

    afterEach(async () => {
      for (const modLog of createdAtModLogs) {
        await modLog.$query().delete()
      }

      await createdAtTestRecord.$query().delete()
    })

    describe('when a return version has no mod log history', () => {
      beforeEach(async () => {
        fetchedRecord = await ReturnVersionModel.query().findById(createdAtTestRecord.id).modify('history')
      })

      it('returns the return version "created at" time stamp', () => {
        const result = fetchedRecord.$createdAt()

        expect(result).toEqual(createdAtTestRecord.createdAt)
      })
    })

    describe('when a return version has mod log history', () => {
      beforeEach(async () => {
        const regionCode = randomRegionCode()
        const firstNaldId = generateRandomInteger(100, 99998)

        createdAtModLogs.push(
          await ModLogHelper.add({
            externalId: `${regionCode}:${firstNaldId}`,
            naldDate: new Date('2012-06-01'),
            returnVersionId: createdAtTestRecord.id
          })
        )
        createdAtModLogs.push(
          await ModLogHelper.add({
            externalId: `${regionCode}:${firstNaldId + 1}`,
            naldDate: new Date('2012-06-02'),
            returnVersionId: createdAtTestRecord.id
          })
        )

        fetchedRecord = await ReturnVersionModel.query().findById(createdAtTestRecord.id).modify('history')
      })

      it('returns the first mod log NALD date', () => {
        const result = fetchedRecord.$createdAt()

        expect(result).toEqual(new Date('2012-06-01'))
      })
    })
  })

  describe('$createdBy', () => {
    let createdByModLogs
    let createdByTestRecord
    let fetchedRecord

    beforeEach(async () => {
      createdByModLogs = []
    })

    afterEach(async () => {
      for (const modLog of createdByModLogs) {
        await modLog.$query().delete()
      }

      await createdByTestRecord.$query().delete()
    })

    describe('when the return version was created in WRLS', () => {
      beforeEach(async () => {
        createdByTestRecord = await ReturnVersionHelper.add({ createdBy: testUser.userId })
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          fetchedRecord = await ReturnVersionModel.query().findById(createdByTestRecord.id).modify('history')
        })

        it('returns the WRLS user name', () => {
          const result = fetchedRecord.$createdBy()

          expect(result).toEqual(testUser.username)
        })
      })

      describe('and has mod log history', () => {
        beforeEach(async () => {
          createdByModLogs.push(await ModLogHelper.add({ returnVersionId: createdByTestRecord.id }))

          fetchedRecord = await ReturnVersionModel.query().findById(createdByTestRecord.id).modify('history')
        })

        it('still returns the WRLS user name', () => {
          const result = fetchedRecord.$createdBy()

          expect(result).toEqual(testUser.username)
        })
      })
    })

    describe('when the return version was created in NALD', () => {
      beforeEach(async () => {
        createdByTestRecord = await ReturnVersionHelper.add()
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          fetchedRecord = await ReturnVersionModel.query().findById(createdByTestRecord.id).modify('history')
        })

        it('returns null', () => {
          const result = fetchedRecord.$createdBy()

          expect(result).toBeNull()
        })
      })

      describe('and has mod log history', () => {
        beforeEach(async () => {
          const regionCode = randomRegionCode()
          const firstNaldId = generateRandomInteger(100, 99998)

          createdByModLogs.push(
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              returnVersionId: createdByTestRecord.id,
              userId: 'FIRST'
            })
          )
          createdByModLogs.push(
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              returnVersionId: createdByTestRecord.id,
              userId: 'SECOND'
            })
          )

          fetchedRecord = await ReturnVersionModel.query().findById(createdByTestRecord.id).modify('history')
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
    let notesModLogs
    let notesTestRecord

    beforeEach(async () => {
      notesModLogs = []
    })

    afterEach(async () => {
      for (const modLog of notesModLogs) {
        await modLog.$query().delete()
      }

      await notesTestRecord.$query().delete()
    })

    describe('when a return version has no mod log history', () => {
      describe('and no notes recorded', () => {
        beforeEach(async () => {
          notesTestRecord = await ReturnVersionHelper.add({ notes: null })

          fetchedRecord = await ReturnVersionModel.query().findById(notesTestRecord.id).modify('history')
        })

        it('returns an empty array', () => {
          const result = fetchedRecord.$notes()

          expect(result).toBeInstanceOf(Array)
          expect(result).toHaveLength(0)
        })
      })

      describe('but notes recorded', () => {
        beforeEach(async () => {
          notesTestRecord = await ReturnVersionHelper.add({ notes: 'Top site bore hole' })

          fetchedRecord = await ReturnVersionModel.query().findById(notesTestRecord.id).modify('history')
        })

        it('returns an array containing just the single note', () => {
          const result = fetchedRecord.$notes()

          expect(result).toEqual(['Top site bore hole'])
        })
      })
    })

    describe('when a return version has mod log history', () => {
      describe('and no notes recorded against the return version', () => {
        beforeEach(async () => {
          notesTestRecord = await ReturnVersionHelper.add({ notes: null })
        })

        describe('and none of the mod log history has notes', () => {
          beforeEach(async () => {
            const regionCode = randomRegionCode()
            const firstNaldId = generateRandomInteger(100, 99998)

            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                note: null,
                returnVersionId: notesTestRecord.id
              })
            )
            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                note: null,
                returnVersionId: notesTestRecord.id
              })
            )

            fetchedRecord = await ReturnVersionModel.query().findById(notesTestRecord.id).modify('history')
          })

          it('returns an empty array', () => {
            const result = fetchedRecord.$notes()

            expect(result).toBeInstanceOf(Array)
            expect(result).toHaveLength(0)
          })
        })

        describe('and some of the mod log history has notes', () => {
          beforeEach(async () => {
            const regionCode = randomRegionCode()
            const firstNaldId = generateRandomInteger(100, 99998)

            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                note: null,
                returnVersionId: notesTestRecord.id
              })
            )
            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                note: 'Transfer per app 12-DEF',
                returnVersionId: notesTestRecord.id
              })
            )

            fetchedRecord = await ReturnVersionModel.query().findById(notesTestRecord.id).modify('history')
          })

          it('returns an array containing just the notes from the mod logs with them', () => {
            const result = fetchedRecord.$notes()

            expect(result).toEqual(['Transfer per app 12-DEF'])
          })
        })
      })

      describe('and notes recorded against the return version', () => {
        describe('and notes in all the mod log history', () => {
          beforeEach(async () => {
            notesTestRecord = await ReturnVersionHelper.add({ notes: 'Top site bore hole' })

            const regionCode = randomRegionCode()
            const firstNaldId = generateRandomInteger(100, 99998)

            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                note: 'New Licence per app 9-ABC',
                returnVersionId: notesTestRecord.id
              })
            )
            notesModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                note: 'Transfer per app 12-DEF',
                returnVersionId: notesTestRecord.id
              })
            )

            fetchedRecord = await ReturnVersionModel.query().findById(notesTestRecord.id).modify('history')
          })

          it('returns all the notes in one array, mod log first and return version last', () => {
            const result = fetchedRecord.$notes()

            expect(result).toEqual(['New Licence per app 9-ABC', 'Transfer per app 12-DEF', 'Top site bore hole'])
          })
        })
      })
    })
  })

  describe('$reason', () => {
    let regionCode
    let firstNaldId
    let fetchedRecord
    let reasonModLogs
    let reasonTestRecord

    beforeEach(() => {
      reasonModLogs = []

      // The "first" mod log record is determined by sorting them by external ID ASC and using the first in the
      // list. So, we have to control the external ID used rather than leaving the helper generate one.
      regionCode = randomRegionCode()
      firstNaldId = generateRandomInteger(100, 99998)
    })

    afterEach(async () => {
      for (const modLog of reasonModLogs) {
        await modLog.$query().delete()
      }

      await reasonTestRecord.$query().delete()
    })

    describe('when the return version has a "local" reason recorded against it', () => {
      describe('that maps to a known "reason"', () => {
        beforeEach(async () => {
          reasonTestRecord = await ReturnVersionHelper.add({ reason: 'major-change' })
        })

        describe('even if the version has mod log history', () => {
          beforeEach(async () => {
            reasonModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                reasonDescription: 'New licence',
                returnVersionId: reasonTestRecord.id
              })
            )

            reasonModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                reasonDescription: 'Minor change',
                returnVersionId: reasonTestRecord.id
              })
            )

            fetchedRecord = await ReturnVersionModel.query().findById(reasonTestRecord.id).modify('history')
          })

          it('returns the mapped reason description', () => {
            const result = fetchedRecord.$reason()

            expect(result).toEqual('Major change')
          })
        })
      })

      describe('that does not map to a known "reason"', () => {
        beforeEach(async () => {
          reasonTestRecord = await ReturnVersionHelper.add({ reason: 'unknown-reason' })
        })

        describe('if the version has mod log history', () => {
          describe('and it has a reason description', () => {
            beforeEach(async () => {
              reasonModLogs.push(
                await ModLogHelper.add({
                  externalId: `${regionCode}:${firstNaldId}`,
                  reasonDescription: 'New licence',
                  returnVersionId: reasonTestRecord.id
                })
              )

              reasonModLogs.push(
                await ModLogHelper.add({
                  externalId: `${regionCode}:${firstNaldId + 1}`,
                  reasonDescription: 'Minor change',
                  returnVersionId: reasonTestRecord.id
                })
              )

              fetchedRecord = await ReturnVersionModel.query().findById(reasonTestRecord.id).modify('history')
            })

            it('returns the NALD reason description', () => {
              const result = fetchedRecord.$reason()

              expect(result).toEqual('New licence')
            })
          })

          describe('but it does not have a reason description', () => {
            beforeEach(async () => {
              reasonModLogs.push(
                await ModLogHelper.add({
                  externalId: `${regionCode}:${firstNaldId}`,
                  reasonDescription: null,
                  returnVersionId: reasonTestRecord.id
                })
              )

              reasonModLogs.push(
                await ModLogHelper.add({
                  externalId: `${regionCode}:${firstNaldId + 1}`,
                  reasonDescription: 'Minor change',
                  returnVersionId: reasonTestRecord.id
                })
              )

              fetchedRecord = await ReturnVersionModel.query().findById(reasonTestRecord.id).modify('history')
            })

            it('returns the unknown reason', () => {
              const result = fetchedRecord.$reason()

              expect(result).toEqual('unknown-reason')
            })
          })
        })
      })
    })

    describe('when the return version does not have a "local" reason recorded against it', () => {
      beforeEach(async () => {
        reasonTestRecord = await ReturnVersionHelper.add({ reason: null })
      })

      describe('and no mod log history', () => {
        beforeEach(async () => {
          fetchedRecord = await ReturnVersionModel.query().findById(reasonTestRecord.id).modify('history')
        })

        it('returns null', () => {
          const result = fetchedRecord.$reason()

          expect(result).toBeNull()
        })
      })

      describe('if the version has mod log history', () => {
        describe('and it has a reason description', () => {
          beforeEach(async () => {
            reasonModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                reasonDescription: 'New licence',
                returnVersionId: reasonTestRecord.id
              })
            )

            reasonModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                reasonDescription: 'Minor change',
                returnVersionId: reasonTestRecord.id
              })
            )

            fetchedRecord = await ReturnVersionModel.query().findById(reasonTestRecord.id).modify('history')
          })

          it('returns the NALD reason description', () => {
            const result = fetchedRecord.$reason()

            expect(result).toEqual('New licence')
          })
        })

        describe('but it does not have a reason description', () => {
          beforeEach(async () => {
            reasonModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId}`,
                reasonDescription: null,
                returnVersionId: reasonTestRecord.id
              })
            )

            reasonModLogs.push(
              await ModLogHelper.add({
                externalId: `${regionCode}:${firstNaldId + 1}`,
                reasonDescription: 'Minor change',
                returnVersionId: reasonTestRecord.id
              })
            )

            fetchedRecord = await ReturnVersionModel.query().findById(reasonTestRecord.id).modify('history')
          })

          it('returns null', () => {
            const result = fetchedRecord.$reason()

            expect(result).toBeNull()
          })
        })
      })
    })
  })
})
