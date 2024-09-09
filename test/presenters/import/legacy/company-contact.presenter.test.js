'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CompanyContactPresenter = require('../../../../app/presenters/import/legacy/company-contact.presenter.js')

describe('Import Legacy Company Contact presenter', () => {
  let legacyCompany

  beforeEach(() => {
    legacyCompany = _legacyCompany()
  })

  it('correctly transforms the data', () => {
    const result = CompanyContactPresenter.go(legacyCompany)

    expect(result).to.equal({
      salutation: 'Mr',
      initials: 'H',
      firstName: 'James',
      lastName: 'Bond',
      externalId: '1:007'
    })
  })
})

function _legacyCompany () {
  return {
    salutation: 'Mr',
    initials: 'H',
    firstName: 'James',
    lastName: 'Bond',
    external_id: '1:007'
  }
}
