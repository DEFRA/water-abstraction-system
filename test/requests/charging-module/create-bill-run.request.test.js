// Test helpers
import * as RegionHelper from '../../support/helpers/region.helper.js'
import http2 from 'node:http2'

// Things we need to stub
import * as ChargingModuleRequest from '../../../app/requests/charging-module.request.js'

// Thing under test
import * as CreateBillRunRequest from '../../../app/requests/charging-module/create-bill-run.request.js'

const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = http2.constants

describe('Charging Module Create Bill Run request', () => {
  let testRegion

  beforeEach(async () => {
    testRegion = RegionHelper.select()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request can create a bill run', () => {
    beforeEach(async () => {
      vi.spyOn(ChargingModuleRequest, 'postRequest').mockResolvedValue({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: HTTP_STATUS_OK,
          body: {
            billRun: {
              id: '2bbbe459-966e-4026-b5d2-2f10867bdddd',
              billRunNumber: 10004
            }
          }
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CreateBillRunRequest.send(testRegion.id, 'sroc')

      expect(result.succeeded).toBe(true)
    })

    it('returns the bill run id and number in the "response"', async () => {
      const result = await CreateBillRunRequest.send(testRegion.id, 'sroc')

      expect(result.response.body.billRun.id).toEqual('2bbbe459-966e-4026-b5d2-2f10867bdddd')
      expect(result.response.body.billRun.billRunNumber).toEqual(10004)
    })
  })

  describe('when the request cannot create a bill run', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'postRequest').mockResolvedValue({
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
        const result = await CreateBillRunRequest.send(testRegion.id, 'sroc')

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateBillRunRequest.send(testRegion.id, 'sroc')

        expect(result.response.body.statusCode).toEqual(HTTP_STATUS_UNAUTHORIZED)
        expect(result.response.body.error).toEqual('Unauthorized')
        expect(result.response.body.message).toEqual('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'postRequest').mockResolvedValue({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CreateBillRunRequest.send(testRegion.id, 'sroc')

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateBillRunRequest.send(testRegion.id, 'sroc')

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
