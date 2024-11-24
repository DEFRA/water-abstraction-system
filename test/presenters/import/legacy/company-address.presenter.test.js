'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CompanyAddressPresenter = require('../../../../app/presenters/import/legacy/company-address.presenter.js')

describe('Import Legacy Company Address presenter', () => {
  const licenceRoleId = generateUUID()

  let legacyLicenceHolderAddress

  beforeEach(() => {
    legacyLicenceHolderAddress = _legacyLicenceHolderCompanyAddress(licenceRoleId)
  })

  it('correctly transforms the data', () => {
    const result = CompanyAddressPresenter.go(legacyLicenceHolderAddress)

    expect(result).to.equal({
      addressId: '7:777',
      companyId: '1:007',
      endDate: null,
      licenceRoleId,
      startDate: new Date('2020-01-01')
    })
  })

  describe('when the role is licence holder', () => {
    describe('and all the dates are null', () => {
      it('correctly sets end date to null', () => {
        const { endDate } = CompanyAddressPresenter.go(legacyLicenceHolderAddress)

        expect(endDate).to.be.null()
      })
    })

    describe('and the end date is a date and the licence dates are null', () => {
      beforeEach(() => {
        const temp = _legacyLicenceHolderCompanyAddress(licenceRoleId)

        legacyLicenceHolderAddress = { ...temp, end_date: new Date('2022-02-02') }
      })

      it('correctly sets end date to the end date value', () => {
        const { endDate } = CompanyAddressPresenter.go(legacyLicenceHolderAddress)

        expect(endDate).to.equal(new Date('2022-02-02'))
      })
    })

    describe('and the revoked date is a date and the other dates are null', () => {
      beforeEach(() => {
        const temp = _legacyLicenceHolderCompanyAddress(licenceRoleId)

        legacyLicenceHolderAddress = { ...temp, revoked_date: new Date('2023-03-03') }
      })

      it('correctly sets end date to the revoked date value', () => {
        const { endDate } = CompanyAddressPresenter.go(legacyLicenceHolderAddress)

        expect(endDate).to.equal(new Date('2023-03-03'))
      })
    })

    describe('and the expired date is a date and the other dates are null', () => {
      beforeEach(() => {
        const temp = _legacyLicenceHolderCompanyAddress(licenceRoleId)

        legacyLicenceHolderAddress = { ...temp, expired_date: new Date('2024-04-04') }
      })

      it('correctly sets end date to the expired date value', () => {
        const { endDate } = CompanyAddressPresenter.go(legacyLicenceHolderAddress)

        expect(endDate).to.equal(new Date('2024-04-04'))
      })
    })

    describe('and the lapsed date is a date and the other dates are null', () => {
      beforeEach(() => {
        const temp = _legacyLicenceHolderCompanyAddress(licenceRoleId)

        legacyLicenceHolderAddress = { ...temp, lapsed_date: new Date('2025-05-05') }
      })

      it('correctly sets end date to the lapsed date value', () => {
        const { endDate } = CompanyAddressPresenter.go(legacyLicenceHolderAddress)

        expect(endDate).to.equal(new Date('2025-05-05'))
      })
    })

    describe('and all the dates have values', () => {
      beforeEach(() => {
        const temp = _legacyLicenceHolderCompanyAddress(licenceRoleId)

        legacyLicenceHolderAddress = {
          ...temp,
          end_date: new Date('2022-02-02'),
          revoked_date: new Date('2023-03-03'),
          expired_date: new Date('2024-04-04'),
          lapsed_date: new Date('2025-05-05')
        }
      })

      it('correctly sets end date latest date of the available dates', () => {
        const { endDate } = CompanyAddressPresenter.go(legacyLicenceHolderAddress)

        expect(endDate).to.equal(new Date('2025-05-05'))
      })
    })
  })
})

function _legacyLicenceHolderCompanyAddress(licenceRoleId) {
  return {
    company_external_id: '1:007',
    external_id: '7:777',
    start_date: new Date('2020-01-01'),
    end_date: null,
    licence_role_id: licenceRoleId,
    revoked_date: null,
    expired_date: null,
    lapsed_date: null,
    licence_role_name: 'licenceHolder'
  }
}
