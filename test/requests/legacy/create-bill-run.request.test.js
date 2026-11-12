// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as LegacyRequest from '../../../src/requests/legacy.request.js'

// Thing under test
import CreateBillRunRequest from '../../../src/requests/legacy/create-bill-run.request.js'

const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = http2.constants

describe('Legacy Create Bill Run request', () => {
  const batchType = 'two_part_tariff'
  const regionId = '8feaf2c1-f7cd-47f1-93b9-0d2218d20d56'
  const financialYearEnding = 2024
  const user = { id: '1c4ce580-9053-4531-ba23-d0cf0caf0562', username: 'carol.shaw@atari.com' }
  const summer = true

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request can create a bill run', () => {
    beforeEach(async () => {
      vi.spyOn(LegacyRequest, 'postRequest').mockResolvedValue({
        response: {
          body: null,
          statusCode: HTTP_STATUS_OK
        },
        succeeded: true
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CreateBillRunRequest(batchType, regionId, financialYearEnding, user, summer)

      expect(result.succeeded).toBe(true)
    })

    it('returns a 200 - ok', async () => {
      const result = await CreateBillRunRequest(batchType, regionId, financialYearEnding, user, summer)

      expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      expect(result.response.body).toBeNull()
    })
  })

  describe('when the request cannot create a bill run', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(LegacyRequest, 'postRequest').mockResolvedValue({
          response: {
            body: {
              attributes: { error: 'Invalid JWT: Token format not valid' },
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              statusCode: HTTP_STATUS_UNAUTHORIZED
            },
            statusCode: HTTP_STATUS_UNAUTHORIZED
          },
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CreateBillRunRequest(batchType, regionId, financialYearEnding, user, summer)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateBillRunRequest(batchType, regionId, financialYearEnding, user, summer)

        expect(result.response.body.statusCode).toEqual(HTTP_STATUS_UNAUTHORIZED)
        expect(result.response.body.error).toEqual('Unauthorized')
        expect(result.response.body.message).toEqual('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(LegacyRequest, 'postRequest').mockResolvedValue({
          response: new Error("Timeout awaiting 'request' for 5000ms"),
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CreateBillRunRequest(batchType, regionId, financialYearEnding, user, summer)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateBillRunRequest(batchType, regionId, financialYearEnding, user, summer)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
