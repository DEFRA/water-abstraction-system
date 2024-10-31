'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things to stub
const FetchLicenceService = require('../../../../app/services/import/legacy/fetch-licence.service.js')

// Thing under test
const TransformLicenceService = require('../../../../app/services/import/legacy/transform-licence.service.js')

describe('Import Legacy Transform Licence service', () => {
  let legacyLicence
  let licenceRef

  beforeEach(() => {
    licenceRef = generateLicenceRef()
    legacyLicence = _legacyLicence(licenceRef)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a matching valid legacy licence is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceService, 'go').resolves(legacyLicence)
    })

    it('returns the NALD licence ID, region code, and the licence transformed and validated for WRLS', async () => {
      const result = await TransformLicenceService.go(licenceRef)

      expect(result.naldLicenceId).to.equal('2113')
      expect(result.regionCode).to.equal('6')

      expect(result.transformedLicence).to.equal({
        expiredDate: null,
        lapsedDate: null,
        licenceRef,
        licenceVersions: [],
        regionId: '82d8c1b7-0eed-43a7-a5f9-4e397c08e17e',
        regions: {
          historicalAreaCode: 'KAEA',
          regionalChargeArea: 'Southern',
          standardUnitChargeCode: 'SUCSO',
          localEnvironmentAgencyPlanCode: 'LEME'
        },
        revokedDate: null,
        startDate: new Date('1992-08-19'),
        waterUndertaker: false
      })
    })
  })

  describe('when no matching legacy licence is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceService, 'go').resolves(null)
    })

    it('throws an error', async () => {
      await expect(TransformLicenceService.go(licenceRef)).to.reject()
    })
  })

  describe('when the matching legacy licence is invalid', () => {
    beforeEach(() => {
      legacyLicence.region_id = null

      Sinon.stub(FetchLicenceService, 'go').resolves(legacyLicence)
    })

    it('throws an error', async () => {
      await expect(TransformLicenceService.go(licenceRef)).to.reject()
    })
  })
})

function _legacyLicence (licenceRef) {
  return {
    historical_area_code: 'KAEA',
    environmental_improvement_unit_charge_code: 'SOOTH',
    local_environment_agency_plan_code: 'LEME',
    standard_unit_charge_code: 'SUCSO',
    expiry_date: null,
    region_code: '6',
    id: '2113',
    lapsed_date: null,
    licence_ref: licenceRef,
    original_effective_date: new Date('1992-08-19'),
    revoked_date: null,
    earliest_version_start_date: new Date('1999-01-01'),
    region_id: '82d8c1b7-0eed-43a7-a5f9-4e397c08e17e'
  }
}
