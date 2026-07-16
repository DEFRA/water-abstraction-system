// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as ChargingModuleRequest from '../../../app/requests/charging-module.request.js'

// Thing under test
import * as ChargingModuleViewBillRunRequest from '../../../app/requests/charging-module/view-bill-run.request.js'

const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = http2.constants

describe('Charging Module View Bill Run request', () => {
  const billRunId = 'db82bf38-638a-44d3-b1b3-1ae8524d9c38'

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the service can view a bill run', () => {
    beforeEach(async () => {
      vi.spyOn(ChargingModuleRequest, 'getRequest').mockResolvedValue({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: HTTP_STATUS_OK,
          body: {
            // truncated invoice, see CM docs for full invoice https://defra.github.io/sroc-charging-module-api-docs
            invoice: {
              id: '8e32a958-13f3-4ea3-a92d-651b764c2cbe',
              billRunId
            }
          }
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await ChargingModuleViewBillRunRequest.send(billRunId)
      const endpoint = ChargingModuleRequest.getRequest.mock.calls[0][0]

      expect(endpoint).toEqual(`v3/wrls/bill-runs/${billRunId}`)
    })

    it('returns a "true" success status', async () => {
      const result = await ChargingModuleViewBillRunRequest.send(billRunId)

      expect(result.succeeded).toBe(true)
    })

    it('returns the bill run in the "response"', async () => {
      const result = await ChargingModuleViewBillRunRequest.send(billRunId)

      expect(result.response.body.invoice.billRunId).toEqual(billRunId)
    })
  })

  describe('when the service cannot view a bill run', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: {
            info: {
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
            },
            statusCode: HTTP_STATUS_UNAUTHORIZED,
            body: {
              statusCode: HTTP_STATUS_UNAUTHORIZED,
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              attributes: { error: 'Invalid JWT: Token format not valid' }
            }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ChargingModuleViewBillRunRequest.send(billRunId)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ChargingModuleViewBillRunRequest.send(billRunId)

        expect(result.response.body.statusCode).toEqual(HTTP_STATUS_UNAUTHORIZED)
        expect(result.response.body.error).toEqual('Unauthorized')
        expect(result.response.body.message).toEqual('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ChargingModuleViewBillRunRequest.send(billRunId)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ChargingModuleViewBillRunRequest.send(billRunId)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
