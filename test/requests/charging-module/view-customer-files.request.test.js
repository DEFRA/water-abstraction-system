import http2 from 'node:http2'
const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = http2.constants

// Test framework dependencies

// Things we need to stub
import * as ChargingModuleRequest from '../../../app/requests/charging-module.request.js'

// Thing under test
import * as ChargingModuleViewCustomerFilesRequest from '../../../app/requests/charging-module/view-customer-files.request.js'

describe('Charging Module - View Customer Files request', () => {
  const days = 7

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
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
          },
          statusCode: HTTP_STATUS_OK,
          body: [
            {
              id: '9523ff61-bd21-4800-aa7d-d97aa6c923aa',
              fileReference: 'nalac50001',
              status: 'exported',
              exportedAt: '2025-08-10T12:34:56.789Z',
              exportedCustomers: ['AB01BEEB', 'BB01BEEB', 'CB01BEEB']
            },
            {
              id: 'aa271bc5-0e36-4aeb-b636-64d95482825f',
              fileReference: 'nalac50002',
              status: 'exported',
              exportedAt: '2025-08-11T13:57:24.680Z',
              exportedCustomers: ['DB02BEEB', 'EB02BEEB', 'FB02BEEB']
            }
          ]
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await ChargingModuleViewCustomerFilesRequest.send(days)
      const endpoint = ChargingModuleRequest.getRequest.mock.calls[0][0]

      expect(endpoint).toEqual(`v3/wrls/customer-files/${days}`)
    })

    it('returns a true success status', async () => {
      const result = await ChargingModuleViewCustomerFilesRequest.send(days)

      expect(result.succeeded).toBe(true)
    })

    it('returns the customer files in the response', async () => {
      const result = await ChargingModuleViewCustomerFilesRequest.send(days)

      expect(result.response.body[0].id).toEqual('9523ff61-bd21-4800-aa7d-d97aa6c923aa')
      expect(result.response.body[1].id).toEqual('aa271bc5-0e36-4aeb-b636-64d95482825f')
    })
  })

  describe('when the service cannot view customer files', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: {
            info: {
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
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

      it('returns a false success status', async () => {
        const result = await ChargingModuleViewCustomerFilesRequest.send(days)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the response', async () => {
        const result = await ChargingModuleViewCustomerFilesRequest.send(days)

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

      it('returns a false success status', async () => {
        const result = await ChargingModuleViewCustomerFilesRequest.send(days)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the response', async () => {
        const result = await ChargingModuleViewCustomerFilesRequest.send(days)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
