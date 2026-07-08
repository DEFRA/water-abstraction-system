import http2 from 'node:http2'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

// Test framework dependencies

// Things we need to stub
import * as AddressFacadeRequest from '../../../app/requests/address-facade.request.js'

// Thing under test
import * as LookupUPRNRequest from '../../../app/requests/address-facade/lookup-uprn.request.js'

describe('Address Facade - Lookup UPRN request', () => {
  const match = {
    uprn: 340116,
    address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
    organisation: 'ENVIRONMENT AGENCY',
    premises: 'HORIZON HOUSE',
    street_address: 'DEANERY ROAD',
    locality: null,
    city: 'BRISTOL',
    postcode: 'BS1 5AH',
    country: 'United Kingdom'
  }
  const uprn = '123456789'

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(async () => {
      vi.spyOn(AddressFacadeRequest, 'getRequest').mockResolvedValue({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body: {
            results: []
          }
        },
        matches: [match]
      })
    })

    it('hits the correct endpoint', async () => {
      await LookupUPRNRequest.send(uprn)

      const requestArgs = AddressFacadeRequest.getRequest.mock.calls[0]

      expect(requestArgs[0]).toEqual(`address-service/v1/addresses/${uprn}?key=client1`)
    })

    it('returns a "true" success status', async () => {
      const result = await LookupUPRNRequest.send(uprn)

      expect(result.succeeded).toBe(true)
    })

    it('returns the matching addresses', async () => {
      const result = await LookupUPRNRequest.send(uprn)

      expect(result.matches).toEqual([match])
    })
  })

  describe('when the request cannot lookup a postcode', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(AddressFacadeRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          },
          matches: []
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupUPRNRequest.send(uprn)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await LookupUPRNRequest.send(uprn)

        expect(result.response.body).toEqual({
          statusCode: HTTP_STATUS_NOT_FOUND,
          error: 'Not Found',
          message: 'Not Found'
        })
      })

      it('does not returns any matches', async () => {
        const result = await LookupUPRNRequest.send(uprn)

        expect(result.matches).toBeDefined()
        expect(result.matches).toBeInstanceOf(Array)
        expect(result.matches).toHaveLength(0)
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(AddressFacadeRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms"),
          matches: []
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupUPRNRequest.send(uprn)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await LookupUPRNRequest.send(uprn)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })

      it('does not returns any matches', async () => {
        const result = await LookupUPRNRequest.send(uprn)

        expect(result.matches).toBeDefined()
        expect(result.matches).toBeInstanceOf(Array)
        expect(result.matches).toHaveLength(0)
      })
    })
  })
})
