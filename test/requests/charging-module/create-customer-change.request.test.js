import http2 from 'node:http2'
const { HTTP_STATUS_CREATED, HTTP_STATUS_UNAUTHORIZED } = http2.constants

// Test framework dependencies

// Things we need to stub
import * as ChargingModuleRequest from '../../../app/requests/charging-module.request.js'

// Thing under test
import * as CreateCustomerChangeRequest from '../../../app/requests/charging-module/create-customer-change.request.js'

describe('Charging Module Create Customer Change request', () => {
  const requestData = {
    region: 'B',
    customerReference: 'B88891136A',
    customerName: 'SCP ESTATE LIMITED',
    addressLine1: 'FAO Mr V P Anderson MBE',
    addressLine2: 'ENVIRONMENT AGENCY',
    addressLine3: 'HORIZON HOUSE',
    addressLine4: 'DEANERY ROAD',
    addressLine5: 'BRISTOL',
    addressLine6: 'United Kingdom',
    postcode: 'BS1 5AH'
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request can create a customer change', () => {
    beforeEach(async () => {
      vi.spyOn(ChargingModuleRequest, 'postRequest').mockResolvedValue({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: HTTP_STATUS_CREATED
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CreateCustomerChangeRequest.send(requestData)

      expect(result.succeeded).toBe(true)
    })
  })

  describe('when the request cannot create a customer change', () => {
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
        const result = await CreateCustomerChangeRequest.send(requestData)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateCustomerChangeRequest.send(requestData)

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
        const result = await CreateCustomerChangeRequest.send(requestData)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateCustomerChangeRequest.send(requestData)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
