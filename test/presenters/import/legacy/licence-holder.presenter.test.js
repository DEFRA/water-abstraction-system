'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const LicenceHolderPresenter = require('../../../../app/presenters/import/legacy/licence-holder.presenter.js')

describe('Import Legacy Licence Holder presenter', () => {
  let legacyLicenceHolder
  let licenceRoleId

  beforeEach(() => {
    licenceRoleId = generateUUID()

    legacyLicenceHolder = _legacyLicenceHolder(licenceRoleId)
  })

  it('correctly transforms the data', () => {
    const result = LicenceHolderPresenter.go(legacyLicenceHolder)

    expect(result).to.equal({
      companyExternalId: '1:007',
      contactExternalId: '1:007',
      startDate: new Date('2001-01-01'),
      licenceRoleId
    })
  })
})

function _legacyLicenceHolder (licenceRoleId) {
  return {
    company_external_id: '1:007',
    contact_external_id: '1:007',
    start_date: new Date('2001-01-01'),
    licence_role_id: licenceRoleId
  }
}
