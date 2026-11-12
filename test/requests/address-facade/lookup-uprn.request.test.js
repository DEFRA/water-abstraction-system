// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as AddressFacadeRequest from '../../../src/requests/address-facade.request.js'

// Thing under test
import LookupUPRNRequest from '../../../src/requests/address-facade/lookup-uprn.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Address Facade - Lookup UPRN request', () => {
  const match = {
    address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
    city: 'BRISTOL',
    country: 'United Kingdom',
    locality: null,
    organisation: 'ENVIRONMENT AGENCY',
    postcode: 'BS1 5AH',
    premises: 'HORIZON HOUSE',
    street_address: 'DEANERY ROAD',
    uprn: 340116
  }
  const uprn = '123456789'

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(async () => {
      vi.spyOn(AddressFacadeRequest, 'getRequest').mockResolvedValue({
        matches: [match],
        response: {
          body: {
            results: []
          },
          statusCode: HTTP_STATUS_OK
        },
        succeeded: true
      })
    })

    it('hits the correct endpoint', async () => {
      await LookupUPRNRequest(uprn)

      const requestArgs = AddressFacadeRequest.getRequest.mock.calls[0]

      expect(requestArgs[0]).toEqual(`address-service/v1/addresses/${uprn}?key=client1`)
    })

    it('returns a "true" success status', async () => {
      const result = await LookupUPRNRequest(uprn)

      expect(result.succeeded).toBe(true)
    })

    it('returns the matching addresses', async () => {
      const result = await LookupUPRNRequest(uprn)

      expect(result.matches).toEqual([match])
    })
  })

  describe('when the request cannot lookup a postcode', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(AddressFacadeRequest, 'getRequest').mockResolvedValue({
          matches: [],
          response: {
            body: { error: 'Not Found', message: 'Not Found', statusCode: HTTP_STATUS_NOT_FOUND },
            statusCode: HTTP_STATUS_NOT_FOUND
          },
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupUPRNRequest(uprn)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await LookupUPRNRequest(uprn)

        expect(result.response.body).toEqual({
          error: 'Not Found',
          message: 'Not Found',
          statusCode: HTTP_STATUS_NOT_FOUND
        })
      })

      it('does not returns any matches', async () => {
        const result = await LookupUPRNRequest(uprn)

        expect(result.matches).toBeDefined()
        expect(result.matches).toBeInstanceOf(Array)
        expect(result.matches).toHaveLength(0)
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(AddressFacadeRequest, 'getRequest').mockResolvedValue({
          matches: [],
          response: new Error("Timeout awaiting 'request' for 5000ms"),
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupUPRNRequest(uprn)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await LookupUPRNRequest(uprn)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })

      it('does not returns any matches', async () => {
        const result = await LookupUPRNRequest(uprn)

        expect(result.matches).toBeDefined()
        expect(result.matches).toBeInstanceOf(Array)
        expect(result.matches).toHaveLength(0)
      })
    })
  })
})
