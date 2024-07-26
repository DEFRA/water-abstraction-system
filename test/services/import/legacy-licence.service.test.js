'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FetchLegacyImportLicenceService = require('../../../app/services/import/legacy-import/fetch-licence.service.js')
const FetchLegacyImportLicenceVersionsService = require('../../../app/services/import/legacy-import/fetch-licence-versions.service.js')
const FixtureLicence = require('./_fixtures/licence.js')
const FixtureLicenceVersionPurposes = require('./_fixtures/licence-version-purposes.fixture.js')
const FixtureVersion = require('./_fixtures/licence-version.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const PrimaryPurposesSeeder = require('../../support/seeders/primary-purpose.seeder.js')
const PurposesSeeder = require('../../support/seeders/purposes.seeder.js')
const RegionsSeeder = require('../../support/seeders/regions.seeder.js')
const SecondaryPurposesSeeder = require('../../support/seeders/secondary-purpose.seeder.js')

// Thing under test
const LegacyImportLicenceService =
  require('../../../app/services/import/legacy-licence.service.js')

describe('Legacy import licence service', () => {
  const licenceRef = FixtureLicence.LIC_NO

  const region = RegionsSeeder.data.find((region) => {
    return region.displayName === 'Test Region'
  })

  let licenceVersions
  let licenceVersionPurpose
  let version

  before(() => {
    licenceVersionPurpose = FixtureLicenceVersionPurposes
    version = FixtureVersion

    licenceVersions = [{ ...version, purposes: [{ ...licenceVersionPurpose }] }]

    Sinon.stub(FetchLegacyImportLicenceService, 'go').resolves({
      ...FixtureLicence,
      FGAC_REGION_CODE: region.naldRegionId
    })

    Sinon.stub(FetchLegacyImportLicenceVersionsService, 'go').resolves(licenceVersions)
  })

  describe('the "licence" data is imported and saved to the database', () => {
    it('returns the matching licence data', async () => {
      await LegacyImportLicenceService.go(licenceRef)

      const licence = await LicenceModel.query().select('*').where('licenceRef', licenceRef).first()

      expect(licence).to.equal({
        createdAt: new Date(licence.createdAt),
        expiredDate: new Date('2015-03-31'),
        id: licence.id,
        includeInPresrocBilling: 'no',
        includeInSrocBilling: false,
        includeInSrocTptBilling: false,
        lapsedDate: null,
        licenceRef,
        regionId: region.id,
        regions: {
          historicalAreaCode: 'RIDIN',
          localEnvironmentAgencyPlanCode: 'AIREL',
          regionalChargeArea: 'Yorkshire',
          standardUnitChargeCode: 'YORKI'
        },
        revokedDate: null,
        startDate: new Date('2005-06-03'),
        suspendFromBilling: false,
        updatedAt: new Date(licence.updatedAt),
        waterUndertaker: false
      })
    })

    it('returns defaulted columns', async () => {
      await LegacyImportLicenceService.go(licenceRef)

      const licence = await LicenceModel.query().select('*').where('licenceRef', licenceRef).first()

      expect(licence.includeInPresrocBilling).to.equal('no')
      expect(licence.includeInSrocBilling).to.be.false()
      expect(licence.includeInSrocTptBilling).to.be.false()
      expect(licence.suspendFromBilling).to.be.false()
    })
  })

  describe('the "licence versions" ', () => {
    it('returns the matching licence versions data', async () => {
      await LegacyImportLicenceService.go(licenceRef)

      const licence = await LicenceModel.query().select(['id']).where('licenceRef', licenceRef).first()
        .withGraphFetched('licenceVersions')

      const [licenceVersion] = licence.licenceVersions

      expect(licence.licenceVersions).to.be.array()

      expect(licenceVersion).to.equal(
        {
          createdAt: new Date(licenceVersion.createdAt),
          endDate: new Date('2007-06-04'),
          externalId: '3:10000003:100:0',
          id: licenceVersion.id,
          increment: 0,
          issue: 100,
          licenceId: licence.id,
          startDate: new Date('2005-06-05'),
          status: 'superseded',
          updatedAt: new Date(licenceVersion.updatedAt)
        })
    })

    describe('the "licence version purposes"', () => {
      let primaryPurpose
      let purpose
      let secondaryPurpose

      beforeEach(() => {
        primaryPurpose = PrimaryPurposesSeeder.data.find((primaryPurpose) => {
          return primaryPurpose.legacyId === FixtureLicenceVersionPurposes.APUR_APPR_CODE
        })

        purpose = PurposesSeeder.data.find((purpose) => {
          return purpose.legacyId === FixtureLicenceVersionPurposes.APUR_APUS_CODE
        })

        secondaryPurpose = SecondaryPurposesSeeder.data.find((secondaryPurpose) => {
          return secondaryPurpose.legacyId === FixtureLicenceVersionPurposes.APUR_APSE_CODE
        })
      })

      it('returns the matching licence versions purposes data', async () => {
        await LegacyImportLicenceService.go(licenceRef)

        const licence = await LicenceModel.query().select(['id']).where('licenceRef', licenceRef).first()
          .withGraphFetched('licenceVersions').withGraphFetched('licenceVersions.licenceVersionPurposes')

        const [licenceVersion] = licence.licenceVersions
        const { licenceVersionPurposes } = licenceVersion
        const [licenceVersionPurpose] = licenceVersionPurposes

        expect(licence.licenceVersions[0].licenceVersionPurposes).to.be.array()

        expect(licenceVersionPurpose).to.equal(
          {
            id: licenceVersionPurpose.id,
            licenceVersionId: licenceVersion.id,
            primaryPurposeId: primaryPurpose.id,
            secondaryPurposeId: secondaryPurpose.id,
            purposeId: purpose.id,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            timeLimitedStartDate: null,
            timeLimitedEndDate: null,
            notes: null,
            instantQuantity: null,
            dailyQuantity: 1500.2,
            hourlyQuantity: 140.93,
            annualQuantity: 545520,
            externalId: '3:10000004',
            createdAt: new Date(licenceVersionPurpose.createdAt),
            updatedAt: new Date(licenceVersionPurpose.updatedAt)
          })
      })

      it('checks the purposes id, primary purpose id and secondary purpose id match the legacy id provided', async () => {
        await LegacyImportLicenceService.go(licenceRef)

        const licence = await LicenceModel.query().select(['id']).where('licenceRef', licenceRef).first()
          .withGraphFetched('licenceVersions').withGraphFetched('licenceVersions.licenceVersionPurposes')

        const [licenceVersion] = licence.licenceVersions
        const { licenceVersionPurposes } = licenceVersion
        const [licenceVersionPurpose] = licenceVersionPurposes

        expect(licenceVersionPurpose.primaryPurposeId).to.equal(primaryPurpose.id)
        expect(licenceVersionPurpose.secondaryPurposeId).to.equal(secondaryPurpose.id)
        expect(licenceVersionPurpose.purposeId).to.equal(purpose.id)
      })
    })
  })
})
