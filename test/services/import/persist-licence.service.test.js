'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureImportLicence = require('./_fixtures/import-licence.fixture.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const PersistLicenceService =
  require('../../../app/services/import/persist-licence.service.js')

describe('Persist licence service', () => {
  let region
  let licence

  beforeEach(async () => {
    licence = { ...FixtureImportLicence.create() }

    region = RegionHelper.data.find((region) => {
      return region.displayName === 'Test Region'
    })
  })

  describe('when the licence ref does not exist', () => {
    it('returns the created licence', async () => {
      await PersistLicenceService.go(licence)

      const savedLicence = await LicenceModel.query()
        .select('*')
        .where('licenceRef', licence.licenceRef).first()

      expect(savedLicence).to.equal({
        createdAt: savedLicence.createdAt,
        expiredDate: new Date('2015-03-31'),
        id: savedLicence.id,
        includeInPresrocBilling: 'no',
        includeInSrocBilling: false,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
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
        updatedAt: savedLicence.updatedAt,
        waterUndertaker: false
      }
      )
    })
  })

  describe('when the licence ref already exist', () => {
    beforeEach(async () => {
      // create a licence that exists already (DB rule to only allow on occurrence of licence ref)
      await PersistLicenceService.go(licence)
    })

    it('returns newly updated licence', async () => {
      await PersistLicenceService.go({
        licenceRef: licence.licenceRef,
        naldRegionId: region.naldRegionId,
        //  not null constraints
        waterUndertaker: true,
        regions: licence.regions,
        startDate: '2005-06-03'
      })

      const savedLicence = await LicenceModel.query()
        .select('*')
        .where('licenceRef', licence.licenceRef).first()

      expect(savedLicence).to.equal({
        createdAt: savedLicence.createdAt,
        expiredDate: null,
        id: savedLicence.id,
        includeInPresrocBilling: 'no',
        includeInSrocBilling: false,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
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
        updatedAt: savedLicence.updatedAt,
        waterUndertaker: true
      })

      expect(savedLicence.waterUndertaker).to.be.true()
    })
  })
})
