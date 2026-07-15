// Test helpers
import AddressModel from '../../app/models/address.model.js'
import AddressHelper from '../support/helpers/address.helper.js'
import CompanyHelper from '../support/helpers/company.helper.js'
import CompanyModel from '../../app/models/company.model.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import LicenceVersionHelper from '../support/helpers/licence-version.helper.js'
import LicenceVersionPurposeModel from '../../app/models/licence-version-purpose.model.js'
import LicenceVersionPurposesHelper from '../support/helpers/licence-version-purpose.helper.js'
import ModLogHelper from '../support/helpers/mod-log.helper.js'
import ModLogModel from '../../app/models/mod-log.model.js'
import PurposeHelper from '../support/helpers/purpose.helper.js'
import PurposeModel from '../../app/models/purpose.model.js'
import RegionHelper from '../support/helpers/region.helper.js'
import { generateRandomInteger } from '../../app/lib/general.lib.js'

// Thing under test
import LicenceVersionModel from '../../app/models/licence-version.model.js'

describe('Licence Version model', () => {
  let address
  let company
  let licence
  let licenceVersionPurpose
  let purpose
  let licenceVersionId
  let testRecord
  let testRecordModLogs
  let firstIssueLicenceVersion
  let secondIncrementLicenceVersion
  let secondIncrementModLogs

  beforeAll(async () => {
    address = await AddressHelper.add()
    company = await CompanyHelper.add()
    licence = await LicenceHelper.add()

    firstIssueLicenceVersion = await LicenceVersionHelper.add({
      addressId: address.id,
      companyId: company.id,
      endDate: new Date('2002-03-31'),
      licenceId: licence.id,
      startDate: new Date('2000-04-01')
    })

    secondIncrementLicenceVersion = await LicenceVersionHelper.add({
      addressId: address.id,
      companyId: company.id,
      endDate: new Date('2022-03-31'),
      increment: firstIssueLicenceVersion.increment + 1,
      issue: firstIssueLicenceVersion.issue,
      licenceId: firstIssueLicenceVersion.licenceId,
      startDate: new Date('2002-04-01')
    })

    testRecord = await LicenceVersionHelper.add({
      addressId: address.id,
      companyId: company.id,
      increment: firstIssueLicenceVersion.increment,
      issue: firstIssueLicenceVersion.issue + 1,
      licenceId: firstIssueLicenceVersion.licenceId,
      startDate: new Date('2022-04-01')
    })

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

  afterAll(async () => {
    for (const modLog of testRecordModLogs) {
      await modLog.$query().delete()
    }

    for (const modLog of secondIncrementModLogs) {
      await modLog.$query().delete()
    }

    await licenceVersionPurpose.$query().delete()
    await testRecord.$query().delete()
    await secondIncrementLicenceVersion.$query().delete()
    await firstIssueLicenceVersion.$query().delete()
    await licence.$query().delete()
    await company.$query().delete()
    await address.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceVersionModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('address')

        expect(query).toBeDefined()
      })

      it('can eager load the address', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('address')

        expect(result).toBeInstanceOf(LicenceVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.address).toBeInstanceOf(AddressModel)
        expect(result.address).toEqual(address)
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('company')

        expect(query).toBeDefined()
      })

      it('can eager load the company', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).toBeInstanceOf(LicenceVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.company).toBeInstanceOf(CompanyModel)
        expect(result.company).toEqual(company)
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(LicenceVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(licence)
      })
    })

    describe('when linking to mod logs', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('modLogs')

        expect(query).toBeDefined()
      })

      it('can eager load the mod logs', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('modLogs')

        expect(result).toBeInstanceOf(LicenceVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.modLogs).toBeInstanceOf(Array)
        expect(result.modLogs[0]).toBeInstanceOf(ModLogModel)
        expect(result.modLogs).toContainEqual(testRecordModLogs[0])
        expect(result.modLogs).toContainEqual(testRecordModLogs[1])
      })
    })

    describe('when linking to licence version purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('licenceVersionPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purposes', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposes')

        expect(result).toBeInstanceOf(LicenceVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersionPurposes).toBeInstanceOf(Array)
        expect(result.licenceVersionPurposes[0]).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes).toContainEqual(licenceVersionPurpose)
      })
    })

    describe('when linking through licence version purposes to purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query().innerJoinRelated('purposes')

        expect(query).toBeDefined()
      })

      it('can eager load the purposes', async () => {
        const result = await LicenceVersionModel.query().findById(testRecord.id).withGraphFetched('purposes')

        expect(result).toBeInstanceOf(LicenceVersionModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.purposes[0]).toBeInstanceOf(PurposeModel)
        expect(result.purposes).toMatchObject([purpose])
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

        expect(result).toEqual('licence issued')
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

          expect(result).toEqual('no licence issued')
        })
      })

      describe('and was an "issue"', () => {
        beforeEach(async () => {
          changeTypeRecord = await LicenceVersionModel.query().modify('changeType').findById(testRecord.id)
        })

        it('returns "licence issued"', () => {
          const result = changeTypeRecord.$changeType()

          expect(result).toEqual('licence issued')
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

        expect(result).toEqual(firstIssueLicenceVersion.createdAt)
      })
    })

    describe('when the licence version has mod log history', () => {
      beforeEach(async () => {
        createdAtRecord = await LicenceVersionModel.query().findById(testRecord.id).modify('history')
      })

      it('returns the first mod log NALD date', () => {
        const result = createdAtRecord.$createdAt()

        expect(result).toEqual(testRecordModLogs[0].naldDate)
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

        expect(result).toBeNull()
      })
    })

    describe('when the licence version has mod log history', () => {
      beforeEach(async () => {
        createdByRecord = await LicenceVersionModel.query().findById(testRecord.id).modify('history')
      })

      it('returns the first mod log NALD user ID', () => {
        const result = createdByRecord.$createdBy()

        expect(result).toEqual(testRecordModLogs[0].userId)
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

        expect(result).toBeInstanceOf(Array)
        expect(result).toHaveLength(0)
      })
    })

    describe('when the licence version has mod log history', () => {
      describe('but none of the mod log history has notes', () => {
        beforeEach(async () => {
          notesRecord = await LicenceVersionModel.query().findById(secondIncrementLicenceVersion.id).modify('history')
        })

        it('returns an empty array', () => {
          const result = notesRecord.$notes()

          expect(result).toBeInstanceOf(Array)
          expect(result).toHaveLength(0)
        })
      })

      describe('and some of the mod log history has notes', () => {
        beforeEach(async () => {
          notesRecord = await LicenceVersionModel.query().findById(testRecord.id).modify('history')
        })

        it('returns an array containing just the notes from the mod logs with them', () => {
          const result = notesRecord.$notes()

          expect(result).toEqual([testRecordModLogs[1].note])
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

        expect(result).toBeNull()
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

          expect(result).toBeNull()
        })
      })

      describe('and the mod log history has a reason description recorded in the first entry', () => {
        beforeEach(async () => {
          reasonRecord = await LicenceVersionModel.query().findById(testRecord.id).modify('history')
        })

        it('returns the NALD reason description', () => {
          const result = reasonRecord.$reason()

          expect(result).toEqual('New licence')
        })
      })
    })
  })
})
