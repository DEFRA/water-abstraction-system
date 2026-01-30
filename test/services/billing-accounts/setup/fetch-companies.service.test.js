'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyModel = require('../../../../app/models/company.model.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')

// Thing under test
const FetchCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')

describe('Billing Accounts - Setup - Fetch Companies service', () => {
  let acmeFakeCompany
  let fakeCompany
  let fakeLtdCompany

  before(async () => {
    fakeLtdCompany = await CompanyHelper.add({
      name: 'Fake Ltd'
    })
    acmeFakeCompany = await CompanyHelper.add({
      name: 'Acme fake Ltd'
    })
    fakeCompany = await CompanyHelper.add({
      name: 'Fake'
    })
  })

  after(async () => {
    await acmeFakeCompany.$query().delete()
    await fakeCompany.$query().delete()
    await fakeLtdCompany.$query().delete()
  })

  describe('when called with a searchInput', () => {
    it('returns the matching companies', async () => {
      const result = await FetchCompaniesService.go('Fake')

      expect(result).to.equal([
        CompanyModel.fromJson({
          exact: true,
          id: fakeCompany.id,
          name: fakeCompany.name
        }),
        CompanyModel.fromJson({
          exact: false,
          id: acmeFakeCompany.id,
          name: acmeFakeCompany.name
        }),
        CompanyModel.fromJson({
          exact: false,
          id: fakeLtdCompany.id,
          name: fakeLtdCompany.name
        })
      ])
    })
  })
})
