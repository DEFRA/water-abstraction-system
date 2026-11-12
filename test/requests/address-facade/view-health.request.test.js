// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as BaseRequest from 'water-abstraction-engine/requests/base.request.js'

import AddressFacadeConfig from '../../../src/config/address-facade.config.js'

// Thing under test
import ViewHealthRequest from '../../../src/requests/address-facade/view-health.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Address Facade - View Health request', () => {
  let response

  beforeEach(() => {
    vi.replaceProperty(AddressFacadeConfig, 'url', 'http://localhost:8009')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        body: 'hola',
        statusCode: HTTP_STATUS_OK
      }

      vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({ response, succeeded: true })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest()

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from the Address Facade in the "response"', async () => {
      const result = await ViewHealthRequest()

      expect(result.response.body).toEqual(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          body: {
            facade_error_code: 'address_service_error_11',
            facade_error_message: 'HTTP 404 Not Found',
            facade_status_code: HTTP_STATUS_NOT_FOUND,
            supplier_response: null,
            supplier_status_code: null,
            supplier_was_called: null
          },
          statusCode: HTTP_STATUS_NOT_FOUND
        }

        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          response,
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewHealthRequest()

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewHealthRequest()

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
