'use strict'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CompaniesRequest = require('../../../../app/requests/companies-house/companies.request.js')

// Thing under test
const FetchCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')

describe('Billing Accounts - Setup - Fetch Companies service', () => {
  const matches = [
    {
      address_snippet: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      company_number: 340116,
      title: 'ENVIRONMENT AGENCY'
    }
  ]

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a "companySearch" that has responses', () => {
    beforeEach(async () => {
      Sinon.stub(CompaniesRequest, 'send').resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body: {
            items: matches
          }
        },
        matches
      })
    })

    it('returns the matching companies', async () => {
      const result = await FetchCompaniesService.go('ENVIRONMENT')

      expect(result).to.equal([
        {
          companiesHouseId: matches[0].company_number,
          address: `${matches[0].title}, ${matches[0].address_snippet}`
        }
      ])
    })
  })

  describe('when called with a "companySearch" that has no responses', () => {
    beforeEach(async () => {
      Sinon.stub(CompaniesRequest, 'send').resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body: {
            items: []
          }
        },
        matches: []
      })
    })

    it('returns an empty array', async () => {
      const result = await FetchCompaniesService.go('ENVIRONMENT')

      expect(result).to.equal([])
    })
  })

  describe('when called with a "companySearch" and a not 200 status is returned', () => {
    beforeEach(async () => {
      Sinon.stub(CompaniesRequest, 'send').resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_NOT_FOUND,
          body: {
            items: []
          }
        },
        matches: []
      })
    })

    it('returns an empty array', async () => {
      const result = await FetchCompaniesService.go('ENVIRONMENT')

      expect(result).to.equal([])
    })
  })
})
