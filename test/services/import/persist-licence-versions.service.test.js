'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureLegacyLicenceVersionPurposes = require('./_fixtures/legacy-licence-version-purposes.fixture.js')
const FixtureValidLicenceVersions = require('./_fixtures/import-licence-versions.fixture.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const PrimaryPurposesSeeder = require('../../support/seeders/primary-purpose.seeder.js')
const PurposesSeeder = require('../../support/seeders/purposes.seeder.js')
const SecondaryPurposesSeeder = require('../../support/seeders/secondary-purpose.seeder.js')

// Thing under test
const PersistLicenceVersionsService =
  require('../../../app/services/import/persist-licence-versions.service.js')

describe('Persist licence versions and licence versions purposes service', () => {
  let licenceVersionsAndPurposes
  let licence

  let primaryPurpose
  let purpose
  let secondaryPurpose

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    licenceVersionsAndPurposes = [
      {
        ...FixtureValidLicenceVersions.importLicenceVersion,
        purposes: []
      }
    ]

    primaryPurpose = PrimaryPurposesSeeder.data.find((primaryPurpose) => {
      return primaryPurpose.legacyId === FixtureLegacyLicenceVersionPurposes.APUR_APPR_CODE
    })

    purpose = PurposesSeeder.data.find((purpose) => {
      return purpose.legacyId === FixtureLegacyLicenceVersionPurposes.APUR_APUS_CODE
    })

    secondaryPurpose = SecondaryPurposesSeeder.data.find((secondaryPurpose) => {
      return secondaryPurpose.legacyId === FixtureLegacyLicenceVersionPurposes.APUR_APSE_CODE
    })
  })

  describe('when the licence version does not exist', () => {
    it('returns the updated licence version', async () => {
      const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

      const savedLicenceVersion = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', FixtureValidLicenceVersions.importLicenceVersion.externalId).first()

      expect(result).to.equal({
        createdAt: savedLicenceVersion.createdAt.toISOString(),
        endDate: '2002-01-01',
        externalId: FixtureValidLicenceVersions.importLicenceVersion.externalId,
        id: result.id,
        increment: 0,
        issue: 100,
        licenceId: licence.id,
        purposes: [],
        startDate: '2001-01-01',
        status: 'superseded',
        updatedAt: savedLicenceVersion.updatedAt.toISOString()
      })
    })

    describe('and has purposes', () => {
      beforeEach(() => {
        licenceVersionsAndPurposes = [
          {
            ...FixtureValidLicenceVersions.importLicenceVersion,
            purposes: [{ ...FixtureValidLicenceVersions.importLicenceVersionPurpose }]
          }
        ]
      })

      it('returns the updated licence version', async () => {
        const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

        const savedLicenceVersionPurposes = await LicenceVersionModel.query()
          .select('*')
          .where('externalId', FixtureValidLicenceVersions.importLicenceVersion.externalId).first()
          .withGraphFetched('licenceVersionPurposes')

        const [savedLicenceVersionPurpose] = savedLicenceVersionPurposes.licenceVersionPurposes

        expect(result.purposes[0]).to.equal({
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
          hourlyQuantity: 140.93,
          annualQuantity: 545520,
          externalId: '3:10000004',
          createdAt: savedLicenceVersionPurpose.createdAt.toISOString(),
          updatedAt: savedLicenceVersionPurpose.updatedAt.toISOString()
        })
      })
    })
  })

  describe('when the licence version already exists', () => {
    let licenceVersionsAndPurposesUpdated

    beforeEach(async () => {
      await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

      licenceVersionsAndPurposesUpdated = [
        {
          ...FixtureValidLicenceVersions.importLicenceVersion,
          purposes: [],
          increment: 1
        }
      ]
    })

    it('returns the created licence version with updated values', async () => {
      const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposesUpdated, licence.id)

      const savedLicenceVersion = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', FixtureValidLicenceVersions.importLicenceVersion.externalId).first()

      expect(result).to.equal({
        endDate: '2002-01-01',
        externalId: FixtureValidLicenceVersions.importLicenceVersion.externalId,
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

  // todo: add these tests
  // licence exists - purpose newly created and purpose updated ?
})
