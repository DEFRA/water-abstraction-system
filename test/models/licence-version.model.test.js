'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceVersionHolderHelper = require('../support/helpers/licence-version-holder.helper.js')
const LicenceVersionHolderModel = require('../../app/models/licence-version-holder.model.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')
const LicenceVersionPurposesHelper = require('../support/helpers/licence-version-purpose.helper.js')
const ModLogHelper = require('../support/helpers/mod-log.helper.js')
const ModLogModel = require('../../app/models/mod-log.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const RegionHelper = require('../support/helpers/region.helper.js')
const { generateRandomInteger } = require('../../app/lib/general.lib.js')

// Thing under test
const LicenceVersionModel = require('../../app/models/licence-version.model.js')

describe('Licence Version model', () => {
  let company
  let licence
  let licenceVersionHolder
  let licenceVersionPurpose
  let purpose
  let licenceVersionId
  let testRecord
  let testRecordModLogs
  let firstIssueLicenceVersion
  let secondIncrementLicenceVersion
  let secondIncrementModLogs

  before(async () => {
    company = await CompanyHelper.add()
    licence = await LicenceHelper.add()

    firstIssueLicenceVersion = await LicenceVersionHelper.add({
      companyId: company.id,
      endDate: new Date('2002-03-31'),
      licenceId: licence.id,
      startDate: new Date('2000-04-01')
    })

    secondIncrementLicenceVersion = await LicenceVersionHelper.add({
      companyId: company.id,
      endDate: new Date('2022-03-31'),
      increment: firstIssueLicenceVersion.increment + 1,
      issue: firstIssueLicenceVersion.issue,
      licenceId: firstIssueLicenceVersion.licenceId,
      startDate: new Date('2002-04-01')
    })

    testRecord = await LicenceVersionHelper.add({
      companyId: company.id,
      increment: firstIssueLicenceVersion.increment,
      issue: firstIssueLicenceVersion.issue + 1,
      licenceId: firstIssueLicenceVersion.licenceId,
      startDate: new Date('2022-04-01')
    })

    licenceVersionHolder = await LicenceVersionHolderHelper.add({ licenceVersionId: testRecord.id })

    const region = RegionHelper.select()
    const firstNaldId = generateRandomInteger(100, 99998)

    secondIncrementModLogs = [
      await ModLogHelper.add({
        externalId: `${region.naldRegionId}:${firstNaldId}`,
        licenceVersionId: secondIncrementLicenceVersion.id,
        naldDate: new Date('2002-04-01'),
        note: null,
        reasonDescription: null,
        userId: 'INCREMENT'
      }),
      await ModLogHelper.add({
        externalId: `${region.naldRegionId}:${firstNaldId + 1}`,
        licenceVersionId: secondIncrementLicenceVersion.id,
        naldDate: new Date('2002-04-02'),
        note: null,
        reasonDescription: 'New licence',
        userId: 'INCREMENT'
      })
    ]

    testRecordModLogs = [
      await ModLogHelper.add({
        externalId: `${region.naldRegionId}:${firstNaldId + 2}`,
        licenceVersionId: testRecord.id,
        naldDate: new Date('2022-03-30'),
        note: null,
        reasonDescription: 'New licence',
        userId: 'FIRST'
      }),
      await ModLogHelper.add({
        externalId: `${region.naldRegionId}:${firstNaldId + 3}`,
        licenceVersionId: testRecord.id,
        naldDate: new Date('2022-03-31'),
        note: 'Transfer per app 12-DEF',
        reasonDescription: 'Transferred',
        userId: 'SECOND'
      })
    ]

    purpose = PurposeHelper.select()

    licenceVersionPurpose = await LicenceVersionPurposesHelper.add({
      licenceVersionId: testRecord.id,
      purposeId: purpose.id
    })
  })

  after(async () => {
    for (const modLog of testRecordModLogs) {
      await modLog.$query().delete()
    }

    for (const modLog of secondIncrementModLogs) {
      await modLog.$query().delete()
    }

    await licenceVersionPurpose.$query().delete()
    await licenceVersionHolder.$query().delete()
    await testRecord.$query().delete()
    await secondIncrementLicenceVersion.$query().delete()
    await firstIssueLicenceVersion.$query().delete()
    await licence.$query().delete()
    await company.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company holder', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(company)
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(licence)
      })
    })

    describe('when linking to licence version holder', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('licenceVersionHolder')

        expect(query).to.exist()
      })

      it('can eager load the note', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionHolder')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionHolder).to.be.an.instanceOf(LicenceVersionHolderModel)
        expect(result.licenceVersionHolder).to.equal(licenceVersionHolder)
      })
    })

    describe('when linking to mod logs', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('modLogs')

        expect(query).to.exist()
      })

      it('can eager load the mod logs', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('modLogs')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.modLogs).to.be.an.array()
        expect(result.modLogs[0]).to.be.an.instanceOf(ModLogModel)
        expect(result.modLogs).to.include(testRecordModLogs[0])
        expect(result.modLogs).to.include(testRecordModLogs[1])
      })
    })

    describe('when linking to licence version purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('licenceVersionPurposes')

        expect(query).to.exist()
      })

      it('can eager load the licence version purposes', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposes')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposes).to.be.an.array()
        expect(result.licenceVersionPurposes[0]).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes).to.include(licenceVersionPurpose)
      })
    })

    describe('when linking through licence version purposes to purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('purposes')

        expect(query).to.exist()
      })

      it('can eager load the purposes', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('purposes')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.purposes[0]).to.be.an.instanceOf(PurposeModel)
        expect(result.purposes).to.equal([purpose], { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })

  describe('$changeType', () => {
    let changeTypeRecord

    describe('when the licence version is the first', () => {
      beforeEach(async () => {
        changeTypeRecord = await LicenceVersionModel.query().modify('changeType').findById(firstIssueLicenceVersion.id)
      })

      it('returns "licence issued"', () => {
        const result = changeTypeRecord.$changeType()

        expect(result).to.equal('licence issued')
      })
    })

    describe('when the licence version is not the first', () => {
      describe('and was an "increment"', () => {
        beforeEach(async () => {
          changeTypeRecord = await LicenceVersionModel.query()
            .modify('changeType')
            .findById(secondIncrementLicenceVersion.id)
        })

        it('returns "no licence issued"', () => {
          const result = changeTypeRecord.$changeType()

          expect(result).to.equal('no licence issued')
        })
      })

      describe('and was an "issue"', () => {
        beforeEach(async () => {
          changeTypeRecord = await LicenceVersionModel.query().modify('changeType').findById(testRecord.id)
        })

        it('returns "licence issued"', () => {
          const result = changeTypeRecord.$changeType()

          expect(result).to.equal('licence issued')
        })
      })
    })
  })

  describe('$createdAt', () => {
    let createdAtRecord

    describe('when the licence version has no mod log history', () => {
      beforeEach(async () => {
        createdAtRecord = await LicenceVersionModel.query().findById(firstIssueLicenceVersion.id).modify('history')
      })

      it('returns the licence version "created at" time stamp', () => {
        const result = createdAtRecord.$createdAt()

        expect(result).to.equal(firstIssueLicenceVersion.createdAt)
      })
    })

    describe('when the licence version has mod log history', () => {
      beforeEach(async () => {
        createdAtRecord = await LicenceVersionModel.query().findById(testRecord.id).modify('history')
      })

      it('returns the first mod log NALD date', () => {
        const result = createdAtRecord.$createdAt()

        expect(result).to.equal(testRecordModLogs[0].naldDate)
      })
    })
  })

  describe('$createdBy', () => {
    let createdByRecord

    describe('when the licence version has no mod log history', () => {
      beforeEach(async () => {
        createdByRecord = await LicenceVersionModel.query().findById(firstIssueLicenceVersion.id).modify('history')
      })

      it('returns the null', () => {
        const result = createdByRecord.$createdBy()

        expect(result).to.be.null()
      })
    })

    describe('when the licence version has mod log history', () => {
      beforeEach(async () => {
        createdByRecord = await LicenceVersionModel.query().findById(testRecord.id).modify('history')
      })

      it('returns the first mod log NALD user ID', () => {
        const result = createdByRecord.$createdBy()

        expect(result).to.equal(testRecordModLogs[0].userId)
      })
    })
  })

  describe('$notes', () => {
    let notesRecord

    describe('when the licence version has no mod log history', () => {
      beforeEach(async () => {
        notesRecord = await LicenceVersionModel.query().findById(firstIssueLicenceVersion.id).modify('history')
      })

      it('returns an empty array', () => {
        const result = notesRecord.$notes()

        expect(result).to.be.an.array()
        expect(result).to.be.empty()
      })
    })

    describe('when the licence version has mod log history', () => {
      describe('but none of the mod log history has notes', () => {
        beforeEach(async () => {
          notesRecord = await LicenceVersionModel.query().findById(secondIncrementLicenceVersion.id).modify('history')
        })

        it('returns an empty array', () => {
          const result = notesRecord.$notes()

          expect(result).to.be.an.array()
          expect(result).to.be.empty()
        })
      })

      describe('and some of the mod log history has notes', () => {
        beforeEach(async () => {
          notesRecord = await LicenceVersionModel.query().findById(testRecord.id).modify('history')
        })

        it('returns an array containing just the notes from the mod logs with them', () => {
          const result = notesRecord.$notes()

          expect(result).to.equal([testRecordModLogs[1].note])
        })
      })
    })
  })

  describe('$reason', () => {
    let reasonRecord

    describe('when the licence version has no mod log history', () => {
      beforeEach(async () => {
        reasonRecord = await LicenceVersionModel.query().findById(firstIssueLicenceVersion.id).modify('history')
      })

      it('returns the null', () => {
        const result = reasonRecord.$reason()

        expect(result).to.be.null()
      })
    })

    describe('when the licence version has mod log history', () => {
      describe('but the mod log history has no reason description recorded in the first entry', () => {
        beforeEach(async () => {
          const regionCode = generateRandomInteger(1, 9)
          const firstNaldId = generateRandomInteger(100, 99998)

          await ModLogHelper.add({
            externalId: `${regionCode}:${firstNaldId}`,
            reasonDescription: null,
            licenceVersionId
          })
          await ModLogHelper.add({
            externalId: `${regionCode}:${firstNaldId + 1}`,
            reasonDescription: 'New licence',
            licenceVersionId
          })

          reasonRecord = await LicenceVersionModel.query().findById(secondIncrementLicenceVersion.id).modify('history')
        })

        it('returns null', () => {
          const result = testRecord.$reason()

          expect(result).to.be.null()
        })
      })

      describe('and the mod log history has a reason description recorded in the first entry', () => {
        beforeEach(async () => {
          reasonRecord = await LicenceVersionModel.query().findById(testRecord.id).modify('history')
        })

        it('returns the NALD reason description', () => {
          const result = reasonRecord.$reason()

          expect(result).to.equal('New licence')
        })
      })
    })
  })
})
