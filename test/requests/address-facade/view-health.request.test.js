import http2 from 'node:http2'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

// Test framework dependencies

// Things we need to stub
import addressFacadeConfig from '../../../config/address-facade.config.js'
import * as BaseRequest from '../../../app/requests/base.request.js'

// Thing under test
import * as ViewHealthRequest from '../../../app/requests/address-facade/view-health.request.js'

describe('Address Facade - View Health request', () => {
  let response

  beforeEach(() => {
    vi.replaceProperty(addressFacadeConfig, 'url', 'http://localhost:8009')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: HTTP_STATUS_OK,
        body: 'hola'
      }

      vi.spyOn(BaseRequest, 'getRequest')
        .mockResolvedValue({ succeeded: true, response })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from the Address Facade in the "response"', async () => {
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
            facade_status_code: HTTP_STATUS_NOT_FOUND,
            facade_error_message: 'HTTP 404 Not Found',
            facade_error_code: 'address_service_error_11',
            supplier_was_called: null,
            supplier_status_code: null,
            supplier_response: null
          }
        }

        vi.spyOn(BaseRequest, 'getRequest')
          .mockImplementation(() => {})
          .withArgs('http://localhost:8009/address-service/hola', { responseType: 'text' })
          .resolves({
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
