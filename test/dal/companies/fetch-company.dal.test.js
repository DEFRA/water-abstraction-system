'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')

// Thing under test
const FetchCompanyDal = require('../../../app/dal/companies/fetch-company.dal.js')

describe('Companies - Fetch Company dal', () => {
  let company

  describe('when there is a company', () => {
    before(async () => {
      company = await CompanyHelper.add()
    })

    it('returns the matching company', async () => {
      const result = await FetchCompanyDal.go(company.id)

      expect(result).to.equal({
        id: company.id,
        name: 'Example Trading Ltd'
      })
    })
  })
})
