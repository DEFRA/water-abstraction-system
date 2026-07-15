import http2 from 'node:http2'

// Things we need to stub
import * as ChargingModuleRequest from '../../../app/requests/charging-module.request.js'

// Thing under test
import * as ReissueBillRequest from '../../../app/requests/charging-module/reissue-bill.request.js'
const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = http2.constants

describe('Charging Module Reissue Bill request', () => {
  const billId = '45ddee2c-c423-4382-8abe-a6a9f284f829'
  const billRunId = 'db82bf38-638a-44d3-b1b3-1ae8524d9c38'

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request can reissue an bill', () => {
    beforeEach(async () => {
      vi.spyOn(ChargingModuleRequest, 'patchRequest').mockResolvedValue({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: HTTP_STATUS_OK,
          body: {
            invoices: [
              {
                id: 'f62faabc-d65e-4242-a106-9777c1d57db7',
                rebilledType: 'C'
              },
              {
                id: 'db82bf38-638a-44d3-b1b3-1ae8524d9c38',
                rebilledType: 'R'
              }
            ]
          }
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await ReissueBillRequest.send(billRunId, billId)
      const endpoint = ChargingModuleRequest.patchRequest.mock.calls[0][0]

      expect(endpoint).toEqual(`v3/wrls/bill-runs/${billRunId}/invoices/${billId}/rebill`)
    })

    it('returns a "true" success status', async () => {
      const result = await ReissueBillRequest.send(billRunId, billId)

      expect(result.succeeded).toBe(true)
    })

    it('returns the bill in the "response"', async () => {
      const result = await ReissueBillRequest.send(billRunId, billId)

      expect(result.response.body.invoices[0].id).toEqual('f62faabc-d65e-4242-a106-9777c1d57db7')
      expect(result.response.body.invoices[0].rebilledType).toEqual('C')
      expect(result.response.body.invoices[1].id).toEqual('db82bf38-638a-44d3-b1b3-1ae8524d9c38')
      expect(result.response.body.invoices[1].rebilledType).toEqual('R')
    })
  })

  describe('when the request cannot reissue a bill run', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'patchRequest').mockResolvedValue({
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
        const result = await ReissueBillRequest.send(billRunId, billId)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ReissueBillRequest.send(billRunId, billId)

        expect(result.response.body.statusCode).toEqual(HTTP_STATUS_UNAUTHORIZED)
        expect(result.response.body.error).toEqual('Unauthorized')
        expect(result.response.body.message).toEqual('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'patchRequest').mockResolvedValue({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ReissueBillRequest.send(billRunId, billId)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ReissueBillRequest.send(billRunId, billId)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
