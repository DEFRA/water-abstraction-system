'use strict'

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')

// Thing under test
const FetchCompanyDal = require('../../../app/dal/companies/fetch-company.dal.js')

describe('Companies - Fetch Company dal', () => {
  let company

  describe('when there is a company', () => {
    beforeAll(async () => {
      company = await CompanyHelper.add()
    })

    it('returns the matching company', async () => {
      const result = await FetchCompanyDal.go(company.id)

      expect(result).toEqual({
        id: company.id,
        name: 'Example Trading Ltd'
      })
    })
  })
})
