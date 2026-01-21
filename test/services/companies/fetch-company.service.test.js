'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')

// Thing under test
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')

describe('Companies - Fetch company service', () => {
  let company

  describe('when there is a company', () => {
    before(async () => {
      company = await CompanyHelper.add()
    })

    it('returns the matching company', async () => {
      const result = await FetchCompanyService.go(company.id)

      expect(result).to.equal({
        id: company.id,
        name: 'Example Trading Ltd'
      })
    })
  })
})
