import http2 from 'node:http2'
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK, HTTP_STATUS_TOO_MANY_REQUESTS } =
  http2.constants

// Test framework dependencies

// Things we need to stub
import * as BaseRequest from '../../app/requests/base.request.js'
import notifyConfig from '../../config/notify.config.js'
import serverConfig from '../../config/server.config.js'

// Thing under test
import * as NotifyRequest from '../../app/requests/notify.request.js'

describe('Notify Request', () => {
  const testRoute = 'TEST_ROUTE'

  beforeAll(async () => {
    // NotifyRequest makes use of the getNotifyToken() server method, which we therefore need to stub.
    // Note that we only need to do this once as it is unaffected by the vi.restoreAllMocks() in our afterEach()
    globalThis.HapiServerMethods = {
      getNotifyToken: vi.fn().mockResolvedValue('ACCESS_TOKEN')
    }
  })

  beforeEach(() => {
    // Set rateLimitPause to a value that won't cause the tests to timeout. By default it's 90 seconds.
    vi.replaceProperty(notifyConfig, 'rateLimitPause', 500)
    // Set the timeout value to 1234ms for these tests. We don't trigger a timeout but we do test that the module
    // uses it when making a request to the charging module, rather than the default request timeout config value
    vi.replaceProperty(notifyConfig, 'timeout', 1234)
    vi.replaceProperty(serverConfig, 'requestTimeout', 1000)
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
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls Notify with the required options', async () => {
        await NotifyRequest.getRequest(testRoute)

        const requestArgs = BaseRequest.getRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('uses the notify timeout', async () => {
        await NotifyRequest.getRequest(testRoute)

        const requestArgs = BaseRequest.getRequest.mock.calls[0]

        expect(requestArgs[1].timeout).toEqual({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await NotifyRequest.getRequest(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await NotifyRequest.getRequest(testRoute)

        expect(result.response.body.testObject.test).toEqual('yes')
      })

      it('returns the status code', async () => {
        const result = await NotifyRequest.getRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
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
        const result = await NotifyRequest.getRequest(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await NotifyRequest.getRequest(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await NotifyRequest.getRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })
    })
  })

  describe('#post', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'postRequest').mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls Notify with the required options', async () => {
        await NotifyRequest.postRequest(testRoute, { test: 'yes' })

        const requestArgs = BaseRequest.postRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: 'Bearer ACCESS_TOKEN' })
        expect(requestArgs[1].json).toEqual({ test: 'yes' })
      })

      it('uses the Notify timeout', async () => {
        await NotifyRequest.postRequest(testRoute)

        const requestArgs = BaseRequest.postRequest.mock.calls[0]

        expect(requestArgs[1].timeout).toEqual({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await NotifyRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await NotifyRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.response.body.testObject.test).toEqual('yes')
      })

      it('returns the status code', async () => {
        const result = await NotifyRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })
    })

    describe('when the request fails', () => {
      describe('because Notify rejects it (for example a validation error)', () => {
        beforeEach(async () => {
          vi.spyOn(BaseRequest, 'postRequest').mockResolvedValue({
            succeeded: false,
            response: {
              statusCode: HTTP_STATUS_BAD_REQUEST,
              statusMessage: 'Bad Request',
              body: {
                errors: [{ error: 'BadRequestError', message: 'email_address Not a valid email address' }],
                status_code: HTTP_STATUS_BAD_REQUEST
              }
            }
          })
        })

        it('returns a "false" success status', async () => {
          const result = await NotifyRequest.postRequest(testRoute, { test: 'yes' })

          expect(result.succeeded).toBe(false)
        })

        it('returns the error response', async () => {
          const result = await NotifyRequest.postRequest(testRoute, { test: 'yes' })

          expect(result.response.body.errors).toEqual([
            { error: 'BadRequestError', message: 'email_address Not a valid email address' }
          ])
        })

        it('returns the status code', async () => {
          const result = await NotifyRequest.postRequest(testRoute, { test: 'yes' })

          expect(result.response.statusCode).toEqual(HTTP_STATUS_BAD_REQUEST)
        })
      })

      describe('because we hit the Notify rate limit', () => {
        let baseRequestStub

        beforeEach(async () => {
          baseRequestStub = vi
            .spyOn(BaseRequest, 'post')
            .mockImplementation(() => {})
            .onFirstCall()
            .resolves({
              succeeded: false,
              response: {
                statusCode: HTTP_STATUS_TOO_MANY_REQUESTS,
                statusMessage: 'Too Many Requests',
                body: {
                  errors: [
                    {
                      error: 'RateLimitError',
                      message: 'Exceeded rate limit for key type live of 3000 requests per 60 seconds'
                    }
                  ],
                  status_code: HTTP_STATUS_TOO_MANY_REQUESTS
                }
              }
            })
            .onSecondCall()
            .resolves({
              succeeded: true,
              response: {
                statusCode: HTTP_STATUS_OK,
                body: { testObject: { test: 'yes' } }
              }
            })
        })

        it('retries the request after the configured pause', async () => {
          const result = await NotifyRequest.postRequest(testRoute, { test: 'yes' })

          expect(baseRequestStub).toHaveBeenCalledTimes(2)
          expect(result.succeeded).toBe(true)
          expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(result.response.body.testObject.test).toEqual('yes')
        })
      })
    })
  })
})
