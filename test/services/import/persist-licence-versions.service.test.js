'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureImportLicenceVersions = require('./_fixtures/import-licence-versions.fixture.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const PrimaryPurposeHelper = require('../../support/helpers/primary-purpose.helper.js')
const SecondaryPurposeHelper = require('../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const PersistLicenceVersionsService =
  require('../../../app/services/import/persist-licence-versions.service.js')

describe('Persist licence versions and licence versions purposes service', () => {
  let licence
  let licenceVersion
  let licenceVersionsPurpose
  let licenceVersionsAndPurposes
  let primaryPurpose
  let purpose
  let secondaryPurpose

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    licenceVersionsAndPurposes = FixtureImportLicenceVersions.create()

    licenceVersion = { ...licenceVersionsAndPurposes[0] }
    licenceVersionsPurpose = { ...licenceVersion.purposes[0] }

    primaryPurpose = PrimaryPurposeHelper.data.find((primaryPurpose) => {
      return primaryPurpose.legacyId === licenceVersionsPurpose.primaryPurposeId
    })

    purpose = PurposeHelper.data.find((purpose) => {
      return purpose.legacyId === licenceVersionsPurpose.purposeId
    })

    secondaryPurpose = SecondaryPurposeHelper.data.find((secondaryPurpose) => {
      return secondaryPurpose.legacyId === licenceVersionsPurpose.secondaryPurposeId
    })
  })

  describe('when the licence version does not exist', () => {
    it('returns the updated licence version', async () => {
      await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

      const savedLicenceVersion = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', licenceVersion.externalId).first()
        .withGraphFetched('licenceVersionPurposes')

      const [savedLicenceVersionPurpose] = savedLicenceVersion.licenceVersionPurposes

      expect(savedLicenceVersion).to.equal({
        createdAt: licenceVersion.createdAt,
        endDate: new Date('2002-01-01'),
        externalId: licenceVersion.externalId,
        id: savedLicenceVersion.id,
        increment: 0,
        issue: 100,
        licenceId: licence.id,
        licenceVersionPurposes: [
          {
            id: savedLicenceVersionPurpose.id,
            licenceVersionId: savedLicenceVersionPurpose.licenceVersionId,
            primaryPurposeId: primaryPurpose.id,
            secondaryPurposeId: secondaryPurpose.id,
            purposeId: purpose.id,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            timeLimitedStartDate: new Date('2001-01-03'),
            timeLimitedEndDate: new Date('2001-01-02'),
            notes: ' a note on purposes',
            instantQuantity: 120,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.929,
            annualQuantity: 545520,
            externalId: licenceVersionsPurpose.externalId,
            createdAt: savedLicenceVersionPurpose.createdAt,
            updatedAt: savedLicenceVersionPurpose.updatedAt
          }
        ],
        startDate: new Date('2001-01-01'),
        status: 'superseded',
        updatedAt: licenceVersion.updatedAt
      })
    })

    describe('and does not have "purposes"', () => {
      beforeEach(() => {
        licenceVersionsAndPurposes = [
          {
            ...licenceVersion,
            purposes: []
          }
        ]
      })

      it('does not return purposes', async () => {
        await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

        const savedLicenceVersionPurposes = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', licenceVersion.externalId).first()
          .withGraphFetched('licenceVersionPurposes')

        expect(savedLicenceVersionPurposes.licenceVersionPurposes).to.equal([])
      })
    })

    describe('and has "purposes"', () => {
      it('returns the created purposes', async () => {
        await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

        const savedLicenceVersionPurposes = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', licenceVersion.externalId).first()
          .withGraphFetched('licenceVersionPurposes')

        const [savedLicenceVersionPurpose] = savedLicenceVersionPurposes.licenceVersionPurposes

        expect(savedLicenceVersionPurposes.licenceVersionPurposes).to.equal([
          {
            id: savedLicenceVersionPurpose.id,
            licenceVersionId: savedLicenceVersionPurpose.licenceVersionId,
            primaryPurposeId: primaryPurpose.id,
            secondaryPurposeId: secondaryPurpose.id,
            purposeId: purpose.id,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            timeLimitedStartDate: new Date('2001-01-03'),
            timeLimitedEndDate: new Date('2001-01-02'),
            notes: ' a note on purposes',
            instantQuantity: 120,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.929,
            annualQuantity: 545520,
            externalId: licenceVersionsPurpose.externalId,
            createdAt: savedLicenceVersionPurpose.createdAt,
            updatedAt: savedLicenceVersionPurpose.updatedAt
          }
        ])
      })
    })
  })

  describe('when the licence version has multiple increments', () => {
    let licenceVersionsAndPurposesUpdated
    // There is a convention where the increment is updated in the third number of an external id.
    // This as far as we can tell is the only element in the id that changes
    // This test has been added to highlight this 'functionality' from the nald data.
    let updatedExternalId

    beforeEach(async () => {
      await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

      const parts = licenceVersion.externalId.split(':')

      parts[2] = '2'
      updatedExternalId = parts.join(':')

      licenceVersionsAndPurposesUpdated = [
        {
          ...licenceVersion,
          purposes: [{ ...licenceVersionsPurpose }],
          externalId: updatedExternalId,
          increment: 2
        }
      ]
    })

    it('returns the licence versions with multiple increments', async () => {
      await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

      const savedLicenceVersions = await LicenceVersionModel.query()
        .select('*')
        .where('licenceId', licence.id).orderBy('increment', 'asc')
        .withGraphFetched('licenceVersionPurposes')

      const [savedLicenceVersionOne, savedLicenceVersionTwo] = savedLicenceVersions

      expect(savedLicenceVersions).to.equal([
        {
          createdAt: savedLicenceVersionOne.createdAt,
          endDate: new Date('2002-01-01'),
          externalId: licenceVersion.externalId,
          id: savedLicenceVersionOne.id,
          increment: 0,
          issue: 100,
          licenceId: licence.id,
          licenceVersionPurposes: [
            {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              annualQuantity: 545520,
              createdAt: savedLicenceVersionOne.licenceVersionPurposes[0].createdAt,
              dailyQuantity: 1500.2,
              externalId: licenceVersionsPurpose.externalId,
              hourlyQuantity: 140.929,
              id: savedLicenceVersionOne.licenceVersionPurposes[0].id,
              instantQuantity: 120,
              licenceVersionId: savedLicenceVersionOne.id,
              notes: ' a note on purposes',
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id,
              timeLimitedEndDate: new Date('2001-01-02'),
              timeLimitedStartDate: new Date(' 2001-01-03'),
              updatedAt: savedLicenceVersionOne.licenceVersionPurposes[0].updatedAt
            }
          ],
          startDate: new Date('2001-01-01'),
          status: 'superseded',
          updatedAt: savedLicenceVersionOne.updatedAt
        },
        {
          createdAt: savedLicenceVersionTwo.createdAt,
          endDate: new Date('2002-01-01'),
          externalId: updatedExternalId,
          id: savedLicenceVersionTwo.id,
          increment: 2,
          issue: 100,
          licenceId: licence.id,
          licenceVersionPurposes: [],
          startDate: new Date('2001-01-01'),
          status: 'superseded',
          updatedAt: savedLicenceVersionTwo.updatedAt
        }
      ])
    })
  })

  describe('when the licence version already exists', () => {
    let licenceVersionsAndPurposesUpdated

    beforeEach(async () => {
      await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

      licenceVersionsAndPurposesUpdated = [
        {
          ...licenceVersion,
          purposes: [{ ...licenceVersionsPurpose }],
          status: 'current'
        }
      ]
    })

    it('returns the updated licence version and purposes', async () => {
      await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

      const savedLicenceVersions = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', licenceVersion.externalId)
        .withGraphFetched('licenceVersionPurposes')

      const savedLicenceVersion = savedLicenceVersions[0]

      const [savedLicenceVersionPurpose] = savedLicenceVersion.licenceVersionPurposes

      expect(savedLicenceVersion).to.equal({
        createdAt: savedLicenceVersion.createdAt,
        endDate: new Date('2002-01-01'),
        externalId: licenceVersion.externalId,
        id: savedLicenceVersion.id,
        increment: 0,
        issue: 100,
        licenceId: licence.id,
        licenceVersionPurposes: [
          {
            id: savedLicenceVersionPurpose.id,
            licenceVersionId: savedLicenceVersionPurpose.licenceVersionId,
            primaryPurposeId: primaryPurpose.id,
            secondaryPurposeId: secondaryPurpose.id,
            purposeId: purpose.id,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            timeLimitedStartDate: new Date('2001-01-03'),
            timeLimitedEndDate: new Date('2001-01-02'),
            notes: ' a note on purposes',
            instantQuantity: 120,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.929,
            annualQuantity: 545520,
            externalId: licenceVersionsPurpose.externalId,
            createdAt: savedLicenceVersionPurpose.createdAt,
            updatedAt: savedLicenceVersionPurpose.updatedAt
          }
        ],
        startDate: new Date('2001-01-01'),
        status: 'current',
        updatedAt: savedLicenceVersion.updatedAt
      })
    })

    it('returns the updated licence version status', async () => {
      await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

      const savedLicenceVersions = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', licenceVersion.externalId)
        .withGraphFetched('licenceVersionPurposes')

      const savedLicenceVersion = savedLicenceVersions[0]

      expect(savedLicenceVersion.status).to.equal('current')
    })

    describe('and does not have purposes', () => {
      beforeEach(async () => {
        await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

        licenceVersionsAndPurposesUpdated[0].purposes = []
      })

      it('returns the updated licence version and no purposes', async () => {
        await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

        const savedLicenceVersion = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', licenceVersion.externalId).first()

        expect(savedLicenceVersion).to.equal({
          createdAt: savedLicenceVersion.createdAt,
          endDate: new Date('2002-01-01'),
          externalId: licenceVersion.externalId,
          id: savedLicenceVersion.id,
          increment: 0,
          issue: 100,
          licenceId: licence.id,
          startDate: new Date('2001-01-01'),
          status: 'current',
          updatedAt: savedLicenceVersion.updatedAt
        })
      })
    })

    describe('and has purposes', () => {
      it('returns the updated licence version purposes', async () => {
        await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

        const savedLicenceVersion = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', licenceVersion.externalId).first()
          .withGraphFetched('licenceVersionPurposes')

        const [savedLicenceVersionPurpose] = savedLicenceVersion.licenceVersionPurposes

        expect(savedLicenceVersion.licenceVersionPurposes).to.equal([
          {
            createdAt: savedLicenceVersionPurpose.createdAt,
            id: savedLicenceVersionPurpose.id,
            licenceVersionId: savedLicenceVersionPurpose.licenceVersionId,
            primaryPurposeId: primaryPurpose.id,
            secondaryPurposeId: secondaryPurpose.id,
            purposeId: purpose.id,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            timeLimitedStartDate: new Date('2001-01-03'),
            timeLimitedEndDate: new Date('2001-01-02'),
            notes: ' a note on purposes',
            instantQuantity: 120,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.929,
            annualQuantity: 545520,
            externalId: licenceVersionsPurpose.externalId,
            updatedAt: savedLicenceVersionPurpose.updatedAt
          }
        ]
        )

        it('checks the purposes id, primary purpose id and secondary purpose id match the legacy id provided', async () => {
          await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

          const savedLicenceVersion = await LicenceVersionModel.query()
            .select('*')
            .where('externalId', licenceVersion.externalId).first()
            .withGraphFetched('licenceVersionPurposes')

          const [savedLicenceVersionPurpose] = savedLicenceVersion.licenceVersionPurposes

          expect(savedLicenceVersionPurpose.primaryPurposeId).to.equal(primaryPurpose.id)
          expect(savedLicenceVersionPurpose.secondaryPurposeId).to.equal(secondaryPurpose.id)
          expect(savedLicenceVersionPurpose.purposeId).to.equal(purpose.id)
        })
      })
    })
  })
})
