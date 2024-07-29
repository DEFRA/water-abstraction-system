'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureLegacyLicenceVersionPurposes = require('./_fixtures/legacy-licence-version-purposes.fixture.js')
const FixtureImportLicenceVersions = require('./_fixtures/import-licence-versions.fixture.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const PrimaryPurposesSeeder = require('../../support/seeders/primary-purpose.seeder.js')
const PurposesSeeder = require('../../support/seeders/purposes.seeder.js')
const SecondaryPurposesSeeder = require('../../support/seeders/secondary-purpose.seeder.js')

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

    licenceVersion = { ...FixtureImportLicenceVersions.importLicenceVersion() }
    licenceVersionsPurpose = { ...FixtureImportLicenceVersions.importLicenceVersionPurpose() }

    licenceVersionsAndPurposes = [
      {
        ...licenceVersion,
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
        .where('externalId', licenceVersion.externalId).first()

      expect(result).to.equal({
        createdAt: savedLicenceVersion.createdAt.toISOString(),
        endDate: '2002-01-01',
        externalId: licenceVersion.externalId,
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
            ...licenceVersion,
            purposes: [{ ...licenceVersionsPurpose }]
          }
        ]
      })

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
            hourlyQuantity: 140.93,
            annualQuantity: 545520,
            // should this be unique ? db says so ?
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
          purposes: [],
          increment: 1
        }
      ]
    })

    it('returns the created licence version with updated values', async () => {
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

  // todo: add these tests
  // licence exists - purpose newly created and purpose updated ?
})
