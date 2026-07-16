// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as SearchCompaniesRequest from '../../../../app/requests/companies-house/search-companies.request.js'

// Thing under test
import FetchCompaniesService from '../../../../app/services/billing-accounts/setup/fetch-companies.service.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Billing Accounts - Setup - Fetch Companies service', () => {
  const matches = [
    {
      address_snippet: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      company_number: 340116,
      title: 'ENVIRONMENT AGENCY'
    }
  ]

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a "companySearch" that has responses', () => {
    beforeEach(async () => {
      vi.spyOn(SearchCompaniesRequest, 'send').mockResolvedValue({
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
      const result = await FetchCompaniesService('ENVIRONMENT')

      expect(result).toEqual([
        {
          address: matches[0].address_snippet,
          number: matches[0].company_number,
          title: matches[0].title
        }
      ])
    })
  })

  describe('when called with a "companySearch" that has no responses', () => {
    beforeEach(async () => {
      vi.spyOn(SearchCompaniesRequest, 'send').mockResolvedValue({
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
      const result = await FetchCompaniesService('ENVIRONMENT')

      expect(result).toEqual([])
    })
  })

  describe('when called with a "companySearch" and a not 200 status is returned', () => {
    beforeEach(async () => {
      vi.spyOn(SearchCompaniesRequest, 'send').mockResolvedValue({
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
      const result = await FetchCompaniesService('ENVIRONMENT')

      expect(result).toEqual([])
    })
  })
})
