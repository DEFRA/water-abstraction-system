'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateRandomInteger } = require('../../app/lib/general.lib.js')
const { randomRegionCode } = require('../support/general.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ModLogHelper = require('../support/helpers/mod-log.helper.js')
const ModLogModel = require('../../app/models/mod-log.model.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')
const UserModel = require('../../app/models/user.model.js')
const UserHelper = require('../support/helpers/user.helper.js')

// Thing under test
const ReturnVersionModel = require('../../app/models/return-version.model.js')

describe('Return Version model', () => {
  let returnVersionId
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReturnVersionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReturnVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { id: licenceId } = testLicence

        testRecord = await ReturnVersionHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ReturnVersionModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(ReturnVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to mod logs', () => {
      let testModLogs

      beforeEach(async () => {
        testRecord = await ReturnVersionHelper.add()

        testModLogs = []
        for (let i = 0; i < 2; i++) {
          const modLog = await ModLogHelper.add({ returnVersionId: testRecord.id })

          testModLogs.push(modLog)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query().innerJoinRelated('modLogs')

        expect(query).to.exist()
      })

      it('can eager load the mod logs', async () => {
        const result = await ReturnVersionModel.query().findById(testRecord.id).withGraphFetched('modLogs')

        expect(result).to.be.instanceOf(ReturnVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.modLogs).to.be.an.array()
        expect(result.modLogs[0]).to.be.an.instanceOf(ModLogModel)
        expect(result.modLogs).to.include(testModLogs[0])
        expect(result.modLogs).to.include(testModLogs[1])
      })
    })

    describe('when linking to return requirements', () => {
      let testReturnRequirements

      beforeEach(async () => {
        testRecord = await ReturnVersionHelper.add()

        testReturnRequirements = []
        for (let i = 0; i < 2; i++) {
          const returnRequirement = await ReturnRequirementHelper.add({
            siteDescription: `TEST RTN REQ ${i}`,
            returnVersionId: testRecord.id
          })

          testReturnRequirements.push(returnRequirement)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query().innerJoinRelated('returnRequirements')

        expect(query).to.exist()
      })

      it('can eager load the return requirements', async () => {
        const result = await ReturnVersionModel.query().findById(testRecord.id).withGraphFetched('returnRequirements')

        expect(result).to.be.instanceOf(ReturnVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirements).to.be.an.array()
        expect(result.returnRequirements[0]).to.be.an.instanceOf(ReturnRequirementModel)
        expect(result.returnRequirements).to.include(testReturnRequirements[0])
        expect(result.returnRequirements).to.include(testReturnRequirements[1])
      })
    })

    describe('when linking to user', () => {
      let testUser

      beforeEach(async () => {
        testUser = UserHelper.select()

        const { id: createdBy } = testUser

        testRecord = await ReturnVersionHelper.add({ createdBy })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnVersionModel.query().innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await ReturnVersionModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).to.be.instanceOf(ReturnVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.user).to.be.an.instanceOf(UserModel)
        expect(result.user).to.equal(testUser, { skip: ['createdAt', 'licenceEntityId', 'password', 'updatedAt'] })
      })
    })
  })

  describe('$createdAt', () => {
    beforeEach(async () => {
      const { id } = await ReturnVersionHelper.add()

      returnVersionId = id
    })

    describe('when a return version has no mod log history', () => {
      beforeEach(async () => {
        testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
      })

      it('returns the return version "created at" time stamp', () => {
        const result = testRecord.$createdAt()

        expect(result).to.equal(testRecord.createdAt)
      })
    })

    describe('when a return version has mod log history', () => {
      beforeEach(async () => {
        const regionCode = randomRegionCode()
        const firstNaldId = generateRandomInteger(100, 99998)

        await ModLogHelper.add({
          externalId: `${regionCode}:${firstNaldId}`,
          naldDate: new Date('2012-06-01'),
          returnVersionId
        })
        await ModLogHelper.add({
          externalId: `${regionCode}:${firstNaldId + 1}`,
          naldDate: new Date('2012-06-02'),
          returnVersionId
        })

        testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
      })

      it('returns the first mod log NALD date', () => {
        const result = testRecord.$createdAt()

        expect(result).to.equal(new Date('2012-06-01'))
      })
    })
  })

  describe('$createdBy', () => {
    describe('when the return version was created in WRLS', () => {
      let testUser

      beforeEach(async () => {
        testUser = UserHelper.select()

        const { id } = await ReturnVersionHelper.add({ createdBy: testUser.id })

        returnVersionId = id
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('returns the WRLS user name', () => {
          const result = testRecord.$createdBy()

          expect(result).to.equal(testUser.username)
        })
      })

      describe('and has mod log history', () => {
        beforeEach(async () => {
          await ModLogHelper.add({ returnVersionId })

          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('still returns the WRLS user name', () => {
          const result = testRecord.$createdBy()

          expect(result).to.equal(testUser.username)
        })
      })
    })

    describe('when the return version was created in NALD', () => {
      beforeEach(async () => {
        const { id } = await ReturnVersionHelper.add()

        returnVersionId = id
      })

      describe('and has no mod log history', () => {
        beforeEach(async () => {
          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('returns null', () => {
          const result = testRecord.$createdBy()

          expect(result).to.be.null()
        })
      })

      describe('and has mod log history', () => {
        beforeEach(async () => {
          const regionCode = randomRegionCode()
          const firstNaldId = generateRandomInteger(100, 99998)

          await ModLogHelper.add({ externalId: `${regionCode}:${firstNaldId}`, returnVersionId, userId: 'FIRST' })
          await ModLogHelper.add({ externalId: `${regionCode}:${firstNaldId + 1}`, returnVersionId, userId: 'SECOND' })

          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('returns the first mod log NALD user ID', () => {
          const result = testRecord.$createdBy()

          expect(result).to.equal('FIRST')
        })
      })
    })
  })

  describe('$notes', () => {
    describe('when a return version has no mod log history', () => {
      describe('and no notes recorded', () => {
        beforeEach(async () => {
          const { id } = await ReturnVersionHelper.add({ notes: null })

          returnVersionId = id

          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('returns an empty array', () => {
          const result = testRecord.$notes()

          expect(result).to.be.an.array()
          expect(result).to.be.empty()
        })
      })

      describe('but notes recorded', () => {
        beforeEach(async () => {
          const { id } = await ReturnVersionHelper.add({ notes: 'Top site bore hole' })

          returnVersionId = id

          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('returns an array containing just the single note', () => {
          const result = testRecord.$notes()

          expect(result).to.equal(['Top site bore hole'])
        })
      })
    })

    describe('when a return version has mod log history', () => {
      describe('and no notes recorded against the return version', () => {
        beforeEach(async () => {
          const { id } = await ReturnVersionHelper.add({ notes: null })

          returnVersionId = id
        })

        describe('and none of the mod log history has notes', () => {
          beforeEach(async () => {
            const regionCode = randomRegionCode()
            const firstNaldId = generateRandomInteger(100, 99998)

            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              note: null,
              returnVersionId
            })
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              note: null,
              returnVersionId
            })

            testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
          })

          it('returns an empty array', () => {
            const result = testRecord.$notes()

            expect(result).to.be.an.array()
            expect(result).to.be.empty()
          })
        })

        describe('and some of the mod log history has notes', () => {
          beforeEach(async () => {
            const regionCode = randomRegionCode()
            const firstNaldId = generateRandomInteger(100, 99998)

            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              note: null,
              returnVersionId
            })
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              note: 'Transfer per app 12-DEF',
              returnVersionId
            })

            testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
          })

          it('returns an array containing just the notes from the mod logs with them', () => {
            const result = testRecord.$notes()

            expect(result).to.equal(['Transfer per app 12-DEF'])
          })
        })
      })

      describe('and notes recorded against the return version', () => {
        describe('and notes in all the mod log history', () => {
          beforeEach(async () => {
            const { id } = await ReturnVersionHelper.add({ notes: 'Top site bore hole' })

            returnVersionId = id

            const regionCode = randomRegionCode()
            const firstNaldId = generateRandomInteger(100, 99998)

            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              note: 'New Licence per app 9-ABC',
              returnVersionId
            })
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              note: 'Transfer per app 12-DEF',
              returnVersionId
            })

            testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
          })

          it('returns all the notes in one array, mod log first and return version last', () => {
            const result = testRecord.$notes()

            expect(result).to.equal(['New Licence per app 9-ABC', 'Transfer per app 12-DEF', 'Top site bore hole'])
          })
        })
      })
    })
  })

  describe('$reason', () => {
    describe('when a return version has no mod log history', () => {
      describe('and no reason recorded', () => {
        beforeEach(async () => {
          const { id } = await ReturnVersionHelper.add({ reason: null })

          returnVersionId = id

          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('returns null', () => {
          const result = testRecord.$reason()

          expect(result).to.be.null()
        })
      })

      describe('but a reason recorded', () => {
        beforeEach(async () => {
          const { id } = await ReturnVersionHelper.add({ reason: 'new-licence' })

          returnVersionId = id

          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('returns the return version reason', () => {
          const result = testRecord.$reason()

          expect(result).to.equal('new-licence')
        })
      })
    })

    describe('when a return version has mod log history', () => {
      describe('and no reason recorded against the return version', () => {
        beforeEach(async () => {
          const { id } = await ReturnVersionHelper.add({ reason: null })

          returnVersionId = id
        })

        describe('but the mod log history has no reason description recorded in the first entry', () => {
          beforeEach(async () => {
            const regionCode = randomRegionCode()
            const firstNaldId = generateRandomInteger(100, 99998)

            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              reasonDescription: null,
              returnVersionId
            })
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              reasonDescription: 'New licence',
              returnVersionId
            })

            testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
          })

          it('returns null', () => {
            const result = testRecord.$reason()

            expect(result).to.be.null()
          })
        })

        describe('and the mod log history has a reason description recorded in the first entry', () => {
          beforeEach(async () => {
            const regionCode = randomRegionCode()
            const firstNaldId = generateRandomInteger(100, 99998)

            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId}`,
              reasonDescription: 'New licence',
              returnVersionId
            })
            await ModLogHelper.add({
              externalId: `${regionCode}:${firstNaldId + 1}`,
              reasonDescription: 'Transferred',
              returnVersionId
            })

            testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
          })

          it('returns the NALD reason description', () => {
            const result = testRecord.$reason()

            expect(result).to.equal('New licence')
          })
        })
      })

      describe('but a reason recorded against the return version', () => {
        beforeEach(async () => {
          const { id } = await ReturnVersionHelper.add({ reason: 'major-change' })

          returnVersionId = id

          await ModLogHelper.add({ reasonDescription: 'New licence', returnVersionId })

          testRecord = await ReturnVersionModel.query().findById(returnVersionId).modify('history')
        })

        it('returns the return version reason', () => {
          const result = testRecord.$reason()

          expect(result).to.equal('major-change')
        })
      })
    })
  })
})
