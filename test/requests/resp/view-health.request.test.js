// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as RespRequest from '../../../app/requests/resp.request.js'

// Thing under test
import * as ViewHealthRequest from '../../../app/requests/resp/view-health.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('ReSP - View Health request', () => {
  let response

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: HTTP_STATUS_OK,
        body: { status: 'alive' }
      }

      vi.spyOn(RespRequest, 'getRequest').mockResolvedValue({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from the ReSP API in the "response"', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.response.body).toEqual(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: HTTP_STATUS_NOT_FOUND,
          body: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            error: 'Not Found',
            message: 'Not Found'
          }
        }

        vi.spyOn(RespRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewHealthRequest.send()

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewHealthRequest.send()

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
