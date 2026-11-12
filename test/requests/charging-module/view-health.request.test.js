// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as ChargingModuleRequest from '../../../src/requests/charging-module.request.js'

// Thing under test
import ViewHealthRequest from '../../../src/requests/charging-module/view-health.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Charging Module - View Health request', () => {
  let response

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        body: { status: 'alive' },
        statusCode: HTTP_STATUS_OK
      }

      vi.spyOn(ChargingModuleRequest, 'getRequest').mockResolvedValue({
        response,
        succeeded: true
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest()

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from the Charging Module in the "response"', async () => {
      const result = await ViewHealthRequest()

      expect(result.response.body).toEqual(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          body: {
            error: 'Not Found',
            message: 'Not Found',
            statusCode: HTTP_STATUS_NOT_FOUND
          },
          statusCode: HTTP_STATUS_NOT_FOUND
        }

        vi.spyOn(ChargingModuleRequest, 'getRequest').mockResolvedValue({
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
