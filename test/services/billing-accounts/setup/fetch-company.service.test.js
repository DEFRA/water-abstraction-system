'use strict'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const LookupCompanysHouseIdRequest = require('../../../../app/requests/companies-house/lookup-companies-house-id.request.js')

// Thing under test
const FetchCompanyService = require('../../../../app/services/billing-accounts/setup/fetch-company.service.js')

describe('Billing Accounts - Setup - Fetch Company service', () => {
  const body = {
    company_number: 340116,
    company_name: 'ENVIRONMENT AGENCY'
  }
  const companiesHouseId = body.company_number

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a "companiesHouseId" that has a reponse', () => {
    beforeEach(async () => {
      Sinon.stub(LookupCompanysHouseIdRequest, 'send').resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body
        }
      })
    })

    it('returns the matching company', async () => {
      const result = await FetchCompanyService.go(companiesHouseId)

      expect(result).to.equal({
        companiesHouseId: body.company_number,
        title: body.company_name
      })
    })
  })

  describe('when called with a "companySearch" that has no responses', () => {
    beforeEach(async () => {
      Sinon.stub(LookupCompanysHouseIdRequest, 'send').resolves({
        succeeded: false,
        response: {
          statusCode: HTTP_STATUS_NOT_FOUND,
          body: {
            message: 'Resource not found for company profile 12345678'
          }
        }
      })
    })

    it('returns an empty array', async () => {
      const result = await FetchCompanyService.go(companiesHouseId)

      expect(result).to.equal(null)
    })
  })
})
