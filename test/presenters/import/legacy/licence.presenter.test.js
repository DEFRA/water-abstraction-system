'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const LicencePresenter = require('../../../../app/presenters/import/legacy/licence.presenter.js')

describe('Import Legacy Licence presenter', () => {
  let legacyLicence

  beforeEach(() => {
    legacyLicence = _legacyLicence()
  })

  it('correctly transforms the data', () => {
    const result = LicencePresenter.go(legacyLicence)

    expect(result).to.equal({
      expiredDate: null,
      lapsedDate: null,
      licenceRef: legacyLicence.licence_ref,
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

  describe('the "regions" property', () => {
    beforeEach(() => {
      legacyLicence.environmental_improvement_unit_charge_code = 'YOOTH'
    })

    it('returns a JSON object where the "regionalChargeArea" is based on the first 2 chars of the EIUC code', () => {
      const result = LicencePresenter.go(legacyLicence)

      expect(result.regions).to.equal({
        historicalAreaCode: 'KAEA',
        regionalChargeArea: 'Yorkshire',
        standardUnitChargeCode: 'SUCSO',
        localEnvironmentAgencyPlanCode: 'LEME'
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when "original_effective_date" is populated in the licence data', () => {
      it('returns "original_effective_date" as the "startDate"', () => {
        const result = LicencePresenter.go(legacyLicence)

        expect(result.startDate).to.equal(legacyLicence.original_effective_date)
      })
    })

    describe('when "original_effective_date" is not populated in the licence data', () => {
      beforeEach(() => {
        legacyLicence.original_effective_date = null
      })

      it('returns "earliest_version_start_date" as the "startDate"', () => {
        const result = LicencePresenter.go(legacyLicence)

        expect(result.startDate).to.equal(legacyLicence.earliest_version_start_date)
      })
    })
  })

  describe('the "waterUndertaker" property', () => {
    describe('when the "environmental_improvement_unit_charge_code" does not end with SWC', () => {
      it('returns false', () => {
        const result = LicencePresenter.go(legacyLicence)

        expect(result.waterUndertaker).to.be.false()
      })
    })

    describe('when the "environmental_improvement_unit_charge_code" ends with SWC', () => {
      beforeEach(() => {
        legacyLicence.environmental_improvement_unit_charge_code = 'SOSWC'
      })

      it('returns true', () => {
        const result = LicencePresenter.go(legacyLicence)

        expect(result.waterUndertaker).to.be.true()
      })
    })
  })
})

function _legacyLicence() {
  return {
    historical_area_code: 'KAEA',
    environmental_improvement_unit_charge_code: 'SOOTH',
    local_environment_agency_plan_code: 'LEME',
    standard_unit_charge_code: 'SUCSO',
    expiry_date: null,
    region_code: '6',
    id: '2113',
    lapsed_date: null,
    licence_ref: generateLicenceRef(),
    original_effective_date: new Date('1992-08-19'),
    revoked_date: null,
    earliest_version_start_date: new Date('1999-01-01'),
    region_id: '82d8c1b7-0eed-43a7-a5f9-4e397c08e17e'
  }
}
