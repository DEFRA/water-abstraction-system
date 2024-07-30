'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureImportLicence = require('./_fixtures/import-licence.fixture.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const RegionsSeeder = require('../../support/seeders/regions.seeder.js')

// Thing under test
const PersistLicenceService =
  require('../../../app/services/import/persist-licence.service.js')

describe('Persist licence service', () => {
  let region
  let licence

  beforeEach(async () => {
    licence = { ...FixtureImportLicence.create() }

    region = RegionsSeeder.data.find((region) => {
      return region.displayName === 'Test Region'
    })
  })

  describe('when the licence ref does not exist', () => {
    it('returns the created licence', async () => {
      const results = await PersistLicenceService.go(licence)

      const savedLicence = await LicenceModel.query()
        .select('*')
        .where('licenceRef', licence.licenceRef).first()

      expect(results).to.equal({
        expiredDate: '2015-03-31',
        id: savedLicence.id,
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
        startDate: '2005-06-03',
        updatedAt: savedLicence.updatedAt.toISOString(),
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
      const results = await PersistLicenceService.go({
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

      expect(results).to.equal({
        expiredDate: undefined,
        id: savedLicence.id,
        lapsedDate: undefined,
        licenceRef: licence.licenceRef,
        regionId: region.id,
        regions: {
          historicalAreaCode: 'RIDIN',
          localEnvironmentAgencyPlanCode: 'AIREL',
          regionalChargeArea: 'Yorkshire',
          standardUnitChargeCode: 'YORKI'
        },
        revokedDate: undefined,
        startDate: '2005-06-03',
        updatedAt: savedLicence.updatedAt.toISOString(),
        waterUndertaker: true
      })

      expect(results.waterUndertaker).to.be.true()
    })
  })
})
