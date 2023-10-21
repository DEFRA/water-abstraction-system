'use strict'

const RequestLib = require('../../app/lib/request.lib.js')
const ChargingModuleRequestLib = require('../../app/lib/charging-module-request.lib.js')

describe('ChargingModuleRequestLib', () => {
  const headers = {
    'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39',
    'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
  }
  const testRoute = 'TEST_ROUTE'

  beforeAll(async () => {
    // ChargingModuleRequestLib makes use of the getChargingModuleToken() server method, which we therefore need to stub
    // Note that we only need to do this once as it is unaffected by the jest.restoreAllMocks() in our afterEach()
    global.HapiServerMethods = {
      getChargingModuleToken: jest.fn().mockResolvedValue({
        accessToken: 'ACCESS_TOKEN',
        expiresIn: 3600
      })
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    // Tidy up our global server methods stub once done
    delete global.HapiServerMethods
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        jest.spyOn(RequestLib, 'get').mockResolvedValue({
          succeeded: true,
          response: {
            headers,
            statusCode: 200,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequestLib.get(testRoute)

        const requestArgs = RequestLib.get.mock.calls[0]

        expect(requestArgs[0]).toContain('TEST_ROUTE')
        expect(requestArgs[1].headers).toEqual({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('returns a `true` success status', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.response.body.testObject.test).toEqual('yes')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.response.statusCode).toEqual(200)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        jest.spyOn(RequestLib, 'get').mockResolvedValue({
          succeeded: false,
          response: {
            headers,
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a `false` success status', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.response.statusCode).toEqual(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

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
        jest.spyOn(RequestLib, 'patch').mockResolvedValue({
          succeeded: true,
          response: {
            headers,
            statusCode: 204,
            body: {}
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequestLib.patch(testRoute)

        const requestArgs = RequestLib.patch.mock.calls[0]

        expect(requestArgs[0]).toContain('TEST_ROUTE')
        expect(requestArgs[1].headers).toEqual({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('returns a `true` success status', async () => {
        const result = await ChargingModuleRequestLib.patch(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequestLib.patch(testRoute)

        expect(result.response.body).toEqual({})
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequestLib.patch(testRoute)

        expect(result.response.statusCode).toEqual(204)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequestLib.patch(testRoute)

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        jest.spyOn(RequestLib, 'patch').mockResolvedValue({
          succeeded: false,
          response: {
            headers,
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a `false` success status', async () => {
        const result = await ChargingModuleRequestLib.patch(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequestLib.patch(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequestLib.patch(testRoute)

        expect(result.response.statusCode).toEqual(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequestLib.patch(testRoute)

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
        jest.spyOn(RequestLib, 'post').mockResolvedValue({
          succeeded: true,
          response: {
            headers,
            statusCode: 200,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        const requestArgs = RequestLib.post.mock.calls[0]

        expect(requestArgs[0]).toContain('TEST_ROUTE')
        expect(requestArgs[1].headers).toEqual({ authorization: 'Bearer ACCESS_TOKEN' })
        expect(requestArgs[1].json).toEqual({ test: 'yes' })
      })

      it('returns a `true` success status', async () => {
        const result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        expect(result.response.body.testObject.test).toEqual('yes')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        expect(result.response.statusCode).toEqual(200)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        jest.spyOn(RequestLib, 'post').mockResolvedValue({
          succeeded: false,
          response: {
            headers,
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a `false` success status', async () => {
        const result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        expect(result.response.statusCode).toEqual(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })

        expect(result.response.info).toEqual({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })
})
