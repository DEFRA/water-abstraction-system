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
      const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

      const savedLicenceVersion = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', licenceVersion.externalId).first()
        .withGraphFetched('licenceVersionPurposes')

      const [savedLicenceVersionPurpose] = savedLicenceVersion.licenceVersionPurposes

      expect(result).to.equal({
        createdAt: savedLicenceVersion.createdAt.toISOString(),
        endDate: '2002-01-01',
        externalId: licenceVersion.externalId,
        id: result.id,
        increment: 0,
        issue: 100,
        licenceId: licence.id,
        purposes: [
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
            timeLimitedStartDate: '2001-01-03',
            timeLimitedEndDate: '2001-01-02',
            notes: ' a note on purposes',
            instantQuantity: 120,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.929,
            annualQuantity: 545520,
            externalId: licenceVersionsPurpose.externalId,
            createdAt: savedLicenceVersionPurpose.createdAt.toISOString(),
            updatedAt: savedLicenceVersionPurpose.updatedAt.toISOString()
          }
        ],
        startDate: '2001-01-01',
        status: 'superseded',
        updatedAt: savedLicenceVersion.updatedAt.toISOString()
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
        const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

        const savedLicenceVersionPurposes = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', licenceVersion.externalId).first()
          .withGraphFetched('licenceVersionPurposes')

        expect(result.purposes).to.equal([])
        expect(savedLicenceVersionPurposes.licenceVersionPurposes).to.equal([])
      })
    })

    describe('and has "purposes"', () => {
      it('returns the created purposes', async () => {
        const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

        const savedLicenceVersionPurposes = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', licenceVersion.externalId).first()
          .withGraphFetched('licenceVersionPurposes')

        const [savedLicenceVersionPurpose] = savedLicenceVersionPurposes.licenceVersionPurposes

        expect(result.purposes).to.equal([
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
            timeLimitedStartDate: '2001-01-03',
            timeLimitedEndDate: '2001-01-02',
            notes: ' a note on purposes',
            instantQuantity: 120,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.929,
            annualQuantity: 545520,
            externalId: licenceVersionsPurpose.externalId,
            createdAt: savedLicenceVersionPurpose.createdAt.toISOString(),
            updatedAt: savedLicenceVersionPurpose.updatedAt.toISOString()
          }
        ])
      })
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
          increment: 1
        }
      ]
    })

    it('returns the updated licence version and purposes', async () => {
      const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

      const savedLicenceVersion = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', licenceVersion.externalId).first()
        .withGraphFetched('licenceVersionPurposes')

      const [savedLicenceVersionPurpose] = savedLicenceVersion.licenceVersionPurposes

      expect(result).to.equal({
        endDate: '2002-01-01',
        externalId: licenceVersion.externalId,
        id: result.id,
        increment: 1,
        issue: 100,
        licenceId: licence.id,
        purposes: [
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
            timeLimitedStartDate: '2001-01-03',
            timeLimitedEndDate: '2001-01-02',
            notes: ' a note on purposes',
            instantQuantity: 120,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.929,
            annualQuantity: 545520,
            externalId: licenceVersionsPurpose.externalId,
            createdAt: savedLicenceVersionPurpose.createdAt.toISOString(),
            updatedAt: savedLicenceVersionPurpose.updatedAt.toISOString()
          }
        ],
        startDate: '2001-01-01',
        status: 'superseded',
        updatedAt: savedLicenceVersion.updatedAt.toISOString()
      }, { skip: ['createdAt'] })
    })

    it('returns the updated licence version increment', async () => {
      const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

      expect(result.increment).to.equal(1)
    })

    describe('and does not have purposes', () => {
      beforeEach(async () => {
        await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

        licenceVersionsAndPurposesUpdated[0].purposes = []
      })

      it('returns the updated licence version and no purposes', async () => {
        const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

        const savedLicenceVersion = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', licenceVersion.externalId).first()

        expect(result).to.equal({
          endDate: '2002-01-01',
          externalId: licenceVersion.externalId,
          id: result.id,
          increment: 1,
          issue: 100,
          licenceId: licence.id,
          purposes: [],
          startDate: '2001-01-01',
          status: 'superseded',
          updatedAt: savedLicenceVersion.updatedAt.toISOString()
        }, { skip: ['createdAt'] })

        expect(result.increment).to.equal(1)
      })
    })

    describe('and has purposes', () => {
      it('returns the updated licence version purposes', async () => {
        const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

        const savedLicenceVersion = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', licenceVersion.externalId).first()
          .withGraphFetched('licenceVersionPurposes')

        const [savedLicenceVersionPurpose] = savedLicenceVersion.licenceVersionPurposes

        expect(result.purposes).to.equal([
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
            timeLimitedStartDate: '2001-01-03',
            timeLimitedEndDate: '2001-01-02',
            notes: ' a note on purposes',
            instantQuantity: 120,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.929,
            annualQuantity: 545520,
            externalId: licenceVersionsPurpose.externalId,
            updatedAt: savedLicenceVersionPurpose.updatedAt.toISOString()
          }
        ], { skip: ['createdAt'] })

        expect(result.increment).to.equal(1)
      })

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
