// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as LegacyRequest from '../../../src/requests/legacy.request.js'

// Thing under test
import ViewHealthRequest from '../../../src/requests/legacy/view-health.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Legacy - View Health request', () => {
  const serviceName = 'import'

  let response

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        body: {
          commit: 'f6d9d43deb8d3a600fa582143e8f4e55b7e0c372',
          version: 'v2.36.1'
        },
        statusCode: HTTP_STATUS_OK
      }

      vi.spyOn(LegacyRequest, 'getRequest').mockResolvedValue({
        response,
        succeeded: true
      }) // TODO: withArgs(serviceName) not converted
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest(serviceName)

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from a Legacy service in the "response"', async () => {
      const result = await ViewHealthRequest(serviceName)

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

        vi.spyOn(LegacyRequest, 'getRequest').mockResolvedValue({
          response,
          succeeded: false
        }) // TODO: withArgs(serviceName) not converted
      })

      it('returns a "false" success status', async () => {
        const result = await ViewHealthRequest(serviceName)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewHealthRequest(serviceName)

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
