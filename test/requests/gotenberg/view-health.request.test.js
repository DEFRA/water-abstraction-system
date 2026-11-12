// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as BaseRequest from 'water-abstraction-engine/requests/base.request.js'

import GotenbergConfig from '../../../src/config/gotenberg.config.js'

// Thing under test
import ViewHealthRequest from '../../../src/requests/gotenberg/view-health.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Gotenberg - View Health request', () => {
  let response

  beforeEach(() => {
    vi.replaceProperty(GotenbergConfig, 'url', 'http://localhost:8040')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        body: {
          details: {
            chromium: {
              status: 'up',
              timestamp: '2025-08-26T23:21:08.772604834Z'
            },
            libreoffice: {
              status: 'up',
              timestamp: '2025-08-26T23:21:08.772586125Z'
            }
          },
          status: 'up'
        },
        statusCode: HTTP_STATUS_OK
      }

      vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
        response,
        succeeded: true
      }) // TODO: withArgs('http://localhost:8040/health', { responseType: 'json' }) not converted
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest()

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from Gotenberg in the "response"', async () => {
      const result = await ViewHealthRequest()

      expect(result.response.body).toEqual(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          body: 'Not Found',
          statusCode: HTTP_STATUS_NOT_FOUND
        }

        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          response,
          succeeded: false
        }) // TODO: withArgs('http://localhost:8040/health', { responseType: 'json' }) not converted
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
