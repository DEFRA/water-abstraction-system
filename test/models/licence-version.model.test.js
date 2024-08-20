'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { randomInteger } = require('../support/general.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionPurposesHelper = require('../support/helpers/licence-version-purpose.helper.js')
const ModLogHelper = require('../support/helpers/mod-log.helper.js')
const ModLogModel = require('../../app/models/mod-log.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const PurposeModel = require('../../app/models/purpose.model.js')

// Thing under test
const LicenceVersionModel = require('../../app/models/licence-version.model.js')

describe('Licence Version model', () => {
  let licenceVersionId
  let testRecord

  beforeEach(async () => {
    testRecord = await LicenceVersionHelper.add()

    licenceVersionId = testRecord.id
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { id: licenceId } = testLicence

        testRecord = await LicenceVersionHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to mod logs', () => {
      let testModLogs

      beforeEach(async () => {
        testRecord = await LicenceVersionHelper.add()

        testModLogs = []
        for (let i = 0; i < 2; i++) {
          const modLog = await ModLogHelper.add({ licenceVersionId: testRecord.id })

          testModLogs.push(modLog)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query()
          .innerJoinRelated('modLogs')

        expect(query).to.exist()
      })

      it('can eager load the mod logs', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('modLogs')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.modLogs).to.be.an.array()
        expect(result.modLogs[0]).to.be.an.instanceOf(ModLogModel)
        expect(result.modLogs).to.include(testModLogs[0])
        expect(result.modLogs).to.include(testModLogs[1])
      })
    })

    describe('when linking through licence version purposes to purposes', () => {
      let purpose

      beforeEach(async () => {
        testRecord = await LicenceVersionHelper.add()
        purpose = PurposeHelper.select()

        const { id } = testRecord

        await LicenceVersionPurposesHelper.add({
          licenceVersionId: id,
          purposeId: purpose.id
        })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query()
          .innerJoinRelated('purposes')

        expect(query).to.exist()
      })

      it('can eager load the purposes', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('purposes')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.purposes[0]).to.be.an.instanceOf(PurposeModel)
        expect(result.purposes).to.equal([purpose], { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })

  describe('$createdBy', () => {
    describe('when the licence version has no mod log history', () => {
      beforeEach(async () => {
        testRecord = await LicenceVersionModel.query().findById(licenceVersionId).modify('history')
      })

      it('returns the null', () => {
        const result = testRecord.$createdBy()

        expect(result).to.be.null()
      })
    })

    describe('when the licence version has mod log history', () => {
      beforeEach(async () => {
        const regionCode = randomInteger(1, 9)
        const firstNaldId = randomInteger(100, 99998)

        await ModLogHelper.add({ externalId: `${regionCode}:${firstNaldId}`, licenceVersionId, userId: 'FIRST' })
        await ModLogHelper.add({ externalId: `${regionCode}:${firstNaldId + 1}`, licenceVersionId, userId: 'SECOND' })

        testRecord = await LicenceVersionModel.query().findById(licenceVersionId).modify('history')
      })

      it('returns the first mod log NALD user ID', () => {
        const result = testRecord.$createdBy()

        expect(result).to.equal('FIRST')
      })
    })
  })
})
