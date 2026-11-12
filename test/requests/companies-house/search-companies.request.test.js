// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as CompaniesHouseRequest from '../../../src/requests/companies-house.request.js'

// Thing under test
import SearchCompaniesRequest from '../../../src/requests/companies-house/search-companies.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Companies House - Search Companies request', () => {
  const matches = [
    {
      address_snippet: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      company_number: 340116,
      title: 'ENVIRONMENT AGENCY'
    }
  ]
  const queryString = 'Example Ltd'

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(async () => {
      vi.spyOn(CompaniesHouseRequest, 'getRequest').mockResolvedValue({
        matches,
        response: {
          body: {
            items: matches
          },
          statusCode: HTTP_STATUS_OK
        },
        succeeded: true
      })
    })

    it('hits the correct endpoint', async () => {
      await SearchCompaniesRequest(queryString)

      const requestArgs = CompaniesHouseRequest.getRequest.mock.calls[0]

      expect(requestArgs[0]).toEqual('search/companies')
    })

    it('returns a "true" success status', async () => {
      const result = await SearchCompaniesRequest(queryString)

      expect(result.succeeded).toBe(true)
    })

    it('returns the matching addresses', async () => {
      const result = await SearchCompaniesRequest(queryString)

      expect(result.matches).toEqual(matches)
    })
  })

  describe('when the request cannot lookup companies', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(CompaniesHouseRequest, 'getRequest').mockResolvedValue({
          matches: [],
          response: {
            body: { error: 'Not Found', message: 'Not Found', statusCode: HTTP_STATUS_NOT_FOUND },
            statusCode: HTTP_STATUS_NOT_FOUND
          },
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await SearchCompaniesRequest(queryString)

        expect(result.succeeded).toBe(false)
      })

      it('returns an error in the "response"', async () => {
        const result = await SearchCompaniesRequest(queryString)

        expect(result.response.body).toEqual({
          error: 'Not Found',
          message: 'Not Found',
          statusCode: HTTP_STATUS_NOT_FOUND
        })
      })

      it('does not returns any matches', async () => {
        const result = await SearchCompaniesRequest(queryString)

        expect(result.response.body.items).toBeUndefined()
        expect(result.matches).toBeInstanceOf(Array)
        expect(result.matches).toHaveLength(0)
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(CompaniesHouseRequest, 'getRequest').mockResolvedValue({
          matches: [],
          response: new Error("Timeout awaiting 'request' for 5000ms"),
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await SearchCompaniesRequest(queryString)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await SearchCompaniesRequest(queryString)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })

      it('does not returns any matches', async () => {
        const result = await SearchCompaniesRequest(queryString)

        expect(result.matches).toBeDefined()
        expect(result.matches).toBeInstanceOf(Array)
        expect(result.matches).toHaveLength(0)
      })
    })
  })
})
