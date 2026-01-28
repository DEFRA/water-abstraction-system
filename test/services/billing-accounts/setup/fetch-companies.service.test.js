'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyModel = require('../../../../app/models/company.model.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')

// Thing under test
const FetchCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')

describe('Billing Accounts - Setup - Fetch Companies service', () => {
  let company

  describe('when a matching company exists', () => {
    beforeEach(async () => {
      company = await CompanyHelper.add()
    })

    it('returns the matching addresses', async () => {
      const result = await FetchCompaniesService.go('Example')

      expect(result).to.include([
        CompanyModel.fromJson({
          id: company.id,
          name: company.name
        })
      ])
    })
  })
})
