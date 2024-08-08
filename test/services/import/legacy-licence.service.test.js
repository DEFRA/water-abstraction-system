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
const FixtureLegacyLicence = require('./_fixtures/legacy-licence.fixture.js')
const FixtureLegacyLicenceVersion = require('./_fixtures/legacy-licence-version.fixture.js')
const FixtureLegacyLicenceVersionPurpose = require('./_fixtures/legacy-licence-version-purpose.fixture.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const PrimaryPurposeHelper = require('../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const SecondaryPurposeHelper = require('../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const LegacyImportLicenceService =
  require('../../../app/services/import/legacy-licence.service.js')

describe('Legacy import licence service', () => {
  const region = RegionHelper.select()

  let legacyLicence
  let licenceRef
  let licenceVersionPurpose
  let licenceVersions
  let version

  before(() => {
    legacyLicence = FixtureLegacyLicence.create()
    licenceRef = legacyLicence.LIC_NO

    licenceVersionPurpose = FixtureLegacyLicenceVersionPurpose.create()
    version = FixtureLegacyLicenceVersion.create()

    licenceVersions = [{ ...version, purposes: [{ ...licenceVersionPurpose }] }]

    Sinon.stub(FetchLegacyImportLicenceService, 'go').resolves({
      ...legacyLicence,
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
        primaryPurpose = PrimaryPurposeHelper.data.find((primaryPurpose) => {
          return primaryPurpose.legacyId === licenceVersionPurpose.APUR_APPR_CODE
        })

        purpose = PurposeHelper.data.find((purpose) => {
          return purpose.legacyId === licenceVersionPurpose.APUR_APUS_CODE
        })

        secondaryPurpose = SecondaryPurposeHelper.data.find((secondaryPurpose) => {
          return secondaryPurpose.legacyId === licenceVersionPurpose.APUR_APSE_CODE
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
    })
  })
})
