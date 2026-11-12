// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as LookupCompanysHouseNumberRequest from '../../../../src/requests/companies-house/lookup-companies-house-number.request.js'

// Thing under test
import FetchCompanyService from '../../../../src/services/billing-accounts/setup/fetch-company.service.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Billing Accounts - Setup - Fetch Company service', () => {
  const body = {
    company_name: 'ENVIRONMENT AGENCY',
    company_number: 340116
  }
  const companiesHouseNumber = body.company_number

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a "companiesHouseNumber" that has a reponse', () => {
    beforeEach(async () => {
      vi.spyOn(LookupCompanysHouseNumberRequest, 'default').mockResolvedValue({
        response: {
          body,
          statusCode: HTTP_STATUS_OK
        },
        succeeded: true
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
      vi.spyOn(LookupCompanysHouseNumberRequest, 'default').mockResolvedValue({
        response: {
          body: {
            message: 'Resource not found for company profile 12345678'
          },
          statusCode: HTTP_STATUS_NOT_FOUND
        },
        succeeded: false
      })
    })

    it('returns an empty array', async () => {
      const result = await FetchCompanyService(companiesHouseNumber)

      expect(result).toBeNull()
    })
  })
})
