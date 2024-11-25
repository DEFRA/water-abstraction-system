'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CompanyContactPresenter = require('../../../../app/presenters/import/legacy/company-contact.presenter.js')

describe('Import Legacy Company Contact presenter', () => {
  let legacyContact
  const licenceRoleId = generateUUID()

  beforeEach(() => {
    legacyContact = _legacyContact(licenceRoleId)
  })

  it('correctly transforms the data', () => {
    const result = CompanyContactPresenter.go(legacyContact)

    expect(result).to.equal({
      startDate: new Date('2020-01-01'),
      licenceRoleId,
      externalId: '1:007'
    })
  })
})

function _legacyContact(licenceRoleId) {
  return {
    salutation: 'Mr',
    initials: 'H',
    first_name: 'James',
    last_name: 'Bond',
    external_id: '1:007',
    start_date: new Date('2020-01-01'),
    licence_role_id: licenceRoleId
  }
}
