import http2 from 'node:http2'

// Things we need to stub
import * as LookupCompanysHouseNumberRequest from '../../../../app/requests/companies-house/lookup-companies-house-number.request.js'

// Thing under test
import FetchCompanyService from '../../../../app/services/billing-accounts/setup/fetch-company.service.js'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Billing Accounts - Setup - Fetch Company service', () => {
  const body = {
    company_number: 340116,
    company_name: 'ENVIRONMENT AGENCY'
  }
  const companiesHouseNumber = body.company_number

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a "companiesHouseNumber" that has a reponse', () => {
    beforeEach(async () => {
      vi.spyOn(LookupCompanysHouseNumberRequest, 'send').mockResolvedValue({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body
        }
      })
    })

    it('returns the matching company', async () => {
      const result = await FetchCompanyService(companiesHouseNumber)

      expect(result).toEqual({
        companiesHouseNumber: body.company_number,
        title: body.company_name
      })
    })
  })

  describe('when called with a "companySearch" that has no responses', () => {
    beforeEach(async () => {
      vi.spyOn(LookupCompanysHouseNumberRequest, 'send').mockResolvedValue({
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
      const result = await FetchCompanyService(companiesHouseNumber)

      expect(result).toEqual(null)
    })
  })
})
