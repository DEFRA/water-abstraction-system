// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as CompaniesHouseRequest from '../../../app/requests/companies-house.request.js'

// Thing under test
import * as LookupCompaniesHouseNumberRequest from '../../../app/requests/companies-house/lookup-companies-house-number.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Companies House - Lookup Companies House Number request', () => {
  const companiesHouseNumber = '12345678'

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(async () => {
      vi.spyOn(CompaniesHouseRequest, 'getRequest').mockResolvedValue({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body: {
            company_number: 12345678,
            company_name: 'Example Ltd'
          }
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

      const requestArgs = CompaniesHouseRequest.getRequest.mock.calls[0]

      expect(requestArgs[0]).toEqual(`company/${companiesHouseNumber}`)
    })

    it('returns a "true" success status', async () => {
      const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

      expect(result.succeeded).toBe(true)
    })

    it('returns the matching company', async () => {
      const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

      expect(result.response.body).toEqual({
        company_number: 12345678,
        company_name: 'Example Ltd'
      })
    })
  })

  describe('when the request cannot lookup the company', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(CompaniesHouseRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            body: { message: 'Resource not found for company profile 12345678' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

        expect(result.succeeded).toBe(false)
      })

      it('returns an error in the "response"', async () => {
        const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

        expect(result.response.body).toEqual({
          message: 'Resource not found for company profile 12345678'
        })
        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(CompaniesHouseRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
