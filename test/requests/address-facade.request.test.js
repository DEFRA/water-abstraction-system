// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as BaseRequest from 'water-abstraction-engine/requests/base.request.js'

// Thing under test
import * as AddressFacadeRequest from '../../src/requests/address-facade.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Address Facade request', () => {
  const headers = {
    'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0',
    'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39'
  }
  const testRoute = 'TEST_ROUTE'

  beforeEach(() => {
    // Set the timeout value to 500ms for these tests. We don't trigger a timeout but we do test that the module
    // uses it when making a request
    // vi.replaceProperty(serverConfig, 'requestTimeout', 500)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          response: {
            body: {
              results: [
                {
                  address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
                  blpu_state_code: 2,
                  blpu_state_code_description: 'In use',
                  blpu_state_date: '12/10/2009',
                  city: 'BRISTOL',
                  classification_code: 'CO01',
                  classification_code_description: 'Office / Work Studio',
                  coordinate_system: null,
                  country: 'United Kingdom',
                  entry_date: '12/10/2009',
                  language: 'EN',
                  last_update_date: '10/02/2016',
                  locality: null,
                  logical_status_code: 1,
                  lpi_logical_status_code: null,
                  lpi_logical_status_code_description: null,
                  match: 1,
                  match_description: 'EXACT',
                  organisation: 'ENVIRONMENT AGENCY',
                  parent_uprn: null,
                  postal_address_code: 'D',
                  postal_address_code_description: 'A record which is linked to PAF',
                  postcode: 'BS1 5AH',
                  premises: 'HORIZON HOUSE',
                  source_data_type: 'dpa',
                  status: 'APPROVED',
                  street_address: 'DEANERY ROAD',
                  topography_layer_toid: 'osgb1000002529079737',
                  uprn: 340116,
                  usrn: null,
                  x: 358205.03,
                  y: 172708.06
                }
              ]
            },
            statusCode: HTTP_STATUS_OK
          },
          succeeded: true
        })
      })

      it('calls the Address Facade with the required options', async () => {
        await AddressFacadeRequest.getRequest(testRoute)

        const requestArgs = BaseRequest.getRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
      })

      it('returns a "true" success status', async () => {
        const result = await AddressFacadeRequest.getRequest(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the matches from the Address Facade', async () => {
        const result = await AddressFacadeRequest.getRequest(testRoute)

        expect(result.matches).toBeDefined()
        expect(result.matches).toBeInstanceOf(Array)
        expect(result.matches[0].uprn).toEqual(340116)
      })

      it('returns the status code', async () => {
        const result = await AddressFacadeRequest.getRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          response: {
            body: { error: 'Not Found', message: 'Not Found', statusCode: HTTP_STATUS_NOT_FOUND },
            headers,
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found'
          },
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await AddressFacadeRequest.getRequest(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await AddressFacadeRequest.getRequest(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await AddressFacadeRequest.getRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })

      it('does not returns any matches', async () => {
        const result = await AddressFacadeRequest.getRequest(testRoute)

        expect(result.matches).toBeDefined()
        expect(result.matches).toBeInstanceOf(Array)
        expect(result.matches).toHaveLength(0)
      })
    })
  })
})
