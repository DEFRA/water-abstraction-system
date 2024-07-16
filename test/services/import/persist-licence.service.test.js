'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')

// Thing under test
const PersistLicenceService =
  require('../../../app/services/import/persist-licence.service.js')

describe.only('Persist licence service', () => {
  let region
  let licence

  beforeEach(async () => {
    region = await RegionHelper.add({
      chargeRegionId: 3,
      naldRegionId: 3
    })
  })

  describe('when the licence ref does not already exist ', () => {
    beforeEach(() => {
      licence = {
        expiredDate: '2015-03-31',
        lapsedDate: null,
        licenceRef: generateLicenceRef(),
        naldRegionId: region.naldRegionId,
        regions: {
          historicalAreaCode: 'RIDIN',
          regionalChargeArea: 'Yorkshire',
          standardUnitChargeCode: 'YORKI',
          localEnvironmentAgencyPlanCode: 'AIREL'
        },
        revokedDate: null,
        startDate: '2005-06-03',
        waterUndertaker: false
      }
    })

    it('returns the created licence', async () => {
      const results = await PersistLicenceService.go(licence)

      const savedLicence = await LicenceModel.query().findById(results.id)

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

  describe('when the licence ref does already exist ', () => {
    beforeEach(async () => {
      licence = {
        expiredDate: '2015-03-31',
        lapsedDate: null,
        licenceRef: generateLicenceRef(),
        naldRegionId: region.naldRegionId,
        regions: {
          historicalAreaCode: 'RIDIN',
          regionalChargeArea: 'Yorkshire',
          standardUnitChargeCode: 'YORKI',
          localEnvironmentAgencyPlanCode: 'AIREL'
        },
        revokedDate: null,
        startDate: '2005-06-03',
        waterUndertaker: false
      }

      // create a licence that exists already (DB rule to only allow on occurrence of licence ref)
      await PersistLicenceService.go(licence)
    })

    it('returns newly updated licence (waterUndertaker to true)', async () => {
      const results = await PersistLicenceService.go({
        licenceRef: licence.licenceRef,
        naldRegionId: region.naldRegionId,
        //  not null constraints
        waterUndertaker: true,
        regions: licence.regions,
        startDate: '2005-06-03'
      })

      const savedLicence = await LicenceModel.query().findById(results.id)

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
    })
  })
})
