import http2 from 'node:http2'

// Test framework dependencies

// Things we need to stub
import * as BaseRequest from '../../app/requests/base.request.js'

// Thing under test
import * as RespRequest from '../../app/requests/resp.request.js'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('ReSP API Request', () => {
  const testRoute = 'TEST_ROUTE'

  beforeAll(() => {
    // RespRequest makes use of the getRespToken() server method, which we therefore need to stub
    // Note that we only need to do this once as it is unaffected by the vi.restoreAllMocks() in our afterEach()
    globalThis.HapiServerMethods = {
      getRespToken: vi.fn().mockResolvedValue({
        accessToken: 'ACCESS_TOKEN',
        expiresIn: 3600
      })
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(() => {
    // Tidy up our global server methods stub once done
    delete globalThis.HapiServerMethods
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(() => {
        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls the ReSP API with the required options', async () => {
        await RespRequest.getRequest(testRoute)

        const requestArgs = BaseRequest.getRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('returns a "true" success status', async () => {
        const result = await RespRequest.getRequest(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await RespRequest.getRequest(testRoute)

        expect(result.response.body.testObject.test).toEqual('yes')
      })

      it('returns the status code', async () => {
        const result = await RespRequest.getRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })
    })

    describe('when the request fails', () => {
      beforeEach(() => {
        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await RespRequest.getRequest(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await RespRequest.getRequest(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await RespRequest.getRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })
    })
  })
})
