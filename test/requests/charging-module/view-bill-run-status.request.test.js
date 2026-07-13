import http2 from 'node:http2'

// Test framework dependencies

// Things we need to stub
import * as ChargingModuleRequest from '../../../app/requests/charging-module.request.js'

// Thing under test
import * as ViewBillRunStatusRequest from '../../../app/requests/charging-module/view-bill-run-status.request.js'
const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = http2.constants

describe('Charging Module View Bill Run Status request', () => {
  const billRunId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
  const transactionData = { billingTransactionId: '2395429b-e703-43bc-8522-ce3f67507ffa' }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request can get a bill run status', () => {
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
            status: 'initialised'
          }
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

      expect(result.succeeded).toBe(true)
    })

    it('returns the bill run status in the "response"', async () => {
      const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

      expect(result.response.body.status).toEqual('initialised')
    })
  })

  describe('when the request cannot get a bill run status', () => {
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
        const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

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
        const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
