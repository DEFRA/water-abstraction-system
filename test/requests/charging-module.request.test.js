import http2 from 'node:http2'

// Things we need to stub
import * as BaseRequest from '../../app/requests/base.request.js'
import chargingModuleConfig from '../../config/charging-module.config.js'
import serverConfig from '../../config/server.config.js'

// Thing under test
import * as ChargingModuleRequest from '../../app/requests/charging-module.request.js'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = http2.constants

describe('Charging Module Request', () => {
  const headers = {
    'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39',
    'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
  }
  const testRoute = 'TEST_ROUTE'

  beforeAll(async () => {
    // ChargingModuleRequest makes use of the getChargingModuleToken() server method, which we therefore need to stub
    // Note that we only need to do this once as it is unaffected by the vi.restoreAllMocks() in our afterEach()
    globalThis.HapiServerMethods = {
      getChargingModuleToken: vi.fn().mockResolvedValue({
        accessToken: 'ACCESS_TOKEN',
        expiresIn: 3600
      })
    }
  })

  beforeEach(() => {
    // Set the timeout value to 1234ms for these tests. We don't trigger a timeout but we do test that the module
    // uses it when making a request to the charging module, rather than the default request timeout config value
    vi.replaceProperty(chargingModuleConfig, 'timeout', 1234)
    vi.replaceProperty(serverConfig, 'requestTimeout', 1000)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(() => {
    // Tidy up our global server methods stub once done
    delete globalThis.HapiServerMethods
  })

  describe('#delete', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'deleteRequest').mockResolvedValue({
          succeeded: true,
          response: {
            headers,
            statusCode: HTTP_STATUS_NO_CONTENT,
            body: {}
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequest.deleteRequest(testRoute)

        const requestArgs = BaseRequest.deleteRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('uses the charging module timeout', async () => {
        await ChargingModuleRequest.deleteRequest(testRoute)

        const requestArgs = BaseRequest.deleteRequest.mock.calls[0]

        expect(requestArgs[1].timeout).toEqual({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleRequest.deleteRequest(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequest.deleteRequest(testRoute)

        expect(result.response.body).toEqual({})
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.deleteRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.deleteRequest(testRoute)

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'deleteRequest').mockResolvedValue({
          succeeded: false,
          response: {
            headers,
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ChargingModuleRequest.deleteRequest(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequest.deleteRequest(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.deleteRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.deleteRequest(testRoute)

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          succeeded: true,
          response: {
            headers,
            statusCode: HTTP_STATUS_OK,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequest.getRequest(testRoute)

        const requestArgs = BaseRequest.getRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('uses the charging module timeout', async () => {
        await ChargingModuleRequest.getRequest(testRoute)

        const requestArgs = BaseRequest.getRequest.mock.calls[0]

        expect(requestArgs[1].timeout).toEqual({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleRequest.getRequest(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequest.getRequest(testRoute)

        expect(result.response.body.testObject.test).toEqual('yes')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.getRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.getRequest(testRoute)

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response: {
            headers,
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ChargingModuleRequest.getRequest(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequest.getRequest(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.getRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.getRequest(testRoute)

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })

  describe('#patch', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'patchRequest').mockResolvedValue({
          succeeded: true,
          response: {
            headers,
            statusCode: HTTP_STATUS_NO_CONTENT,
            body: {}
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequest.patchRequest(testRoute)

        const requestArgs = BaseRequest.patchRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('uses the charging module timeout', async () => {
        await ChargingModuleRequest.patchRequest(testRoute)

        const requestArgs = BaseRequest.patchRequest.mock.calls[0]

        expect(requestArgs[1].timeout).toEqual({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleRequest.patchRequest(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequest.patchRequest(testRoute)

        expect(result.response.body).toEqual({})
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.patchRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.patchRequest(testRoute)

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'patchRequest').mockResolvedValue({
          succeeded: false,
          response: {
            headers,
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ChargingModuleRequest.patchRequest(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequest.patchRequest(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.patchRequest(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.patchRequest(testRoute)

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })

  describe('#post', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'postRequest').mockResolvedValue({
          succeeded: true,
          response: {
            headers,
            statusCode: HTTP_STATUS_OK,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        const requestArgs = BaseRequest.postRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: 'Bearer ACCESS_TOKEN' })
        expect(requestArgs[1].json).toEqual({ test: 'yes' })
      })

      it('uses the charging module timeout', async () => {
        await ChargingModuleRequest.postRequest(testRoute)

        const requestArgs = BaseRequest.postRequest.mock.calls[0]

        expect(requestArgs[1].timeout).toEqual({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.response.body.testObject.test).toEqual('yes')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'postRequest').mockResolvedValue({
          succeeded: false,
          response: {
            headers,
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.postRequest(testRoute, { test: 'yes' })

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })
})
