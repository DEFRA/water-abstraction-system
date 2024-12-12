'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CompanyPresenter = require('../../../../app/presenters/import/legacy/company.presenter.js')

describe('Import Legacy Company presenter', () => {
  let legacyCompany

  beforeEach(() => {
    legacyCompany = _legacyCompany()
  })

  it('correctly transforms the data', () => {
    const result = CompanyPresenter.go(legacyCompany)

    expect(result).to.equal({
      externalId: '1:1940',
      name: 'ACME',
      type: 'organisation',
      addresses: [],
      companyAddresses: []
    })
  })
})

function _legacyCompany() {
  return {
    name: 'ACME',
    type: 'organisation',
    external_id: '1:1940'
  }
}
