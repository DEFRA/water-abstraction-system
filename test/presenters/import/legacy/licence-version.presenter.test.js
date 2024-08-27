'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceVersionPresenter = require('../../../../app/presenters/import/legacy/licence-version.presenter.js')

describe('Import Legacy Licence Version presenter', () => {
  let legacyLicenceVersion

  beforeEach(() => {
    legacyLicenceVersion = _legacyLicenceVersion()
  })

  it('correctly transforms the data', () => {
    const result = LicenceVersionPresenter.go(legacyLicenceVersion)

    expect(result).to.equal({
      endDate: null,
      externalId: '6:2113:100:0',
      increment: 0,
      issue: 100,
      licenceVersionPurposes: [],
      startDate: new Date('1999-01-01'),
      status: 'current'
    })
  })

  describe('the "status" property', () => {
    describe('when the legacy licence version status is "CURR"', () => {
      it('returns "current"', () => {
        const result = LicenceVersionPresenter.go(legacyLicenceVersion)

        expect(result.status).to.equal('current')
      })
    })

    describe('when the legacy licence version status is "SUPER"', () => {
      beforeEach(() => {
        legacyLicenceVersion.status = 'SUPER'
      })

      it('returns "superseded"', () => {
        const result = LicenceVersionPresenter.go(legacyLicenceVersion)

        expect(result.status).to.equal('superseded')
      })
    })
  })
})

function _legacyLicenceVersion () {
  return {
    effective_end_date: null,
    effective_start_date: new Date('1999-01-01'),
    external_id: '6:2113:100:0',
    increment_number: 0,
    issue_no: 100,
    status: 'CURR'
  }
}
