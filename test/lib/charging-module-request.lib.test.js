'use strict'

// Import the module you want to test
const ChargingModuleRequestLib = require('../../app/lib/charging-module-request.lib.js')

// Mocks
const RequestLib = require('../../app/lib/request.lib.js')
jest.mock('../../app/lib/request.lib.js')

describe('ChargingModuleRequestLib', () => {
  const headers = {
    'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39',
    'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
  }
  const testRoute = 'TEST_ROUTE'

  beforeAll(() => {
    // Mock the behavior of HapiServerMethods.getChargingModuleToken
    global.HapiServerMethods = {
      getChargingModuleToken: jest.fn().mockResolvedValue({
        accessToken: 'ACCESS_TOKEN',
        expiresIn: 3600
      })
    }
  })

  afterAll(() => {
    // Cleanup the global mock
    delete global.HapiServerMethods
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(() => {
        RequestLib.get.mockResolvedValue({
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

        expect(RequestLib.get).toHaveBeenCalledWith(
          expect.stringContaining(testRoute),
          expect.objectContaining({
            headers: expect.objectContaining({ authorization: 'Bearer ACCESS_TOKEN' })
          })
        )
      })

      it('returns a `true` success status', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.response.body.testObject.test).toBe('yes')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.response.statusCode).toBe(200)
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
      beforeEach(() => {
        RequestLib.get.mockResolvedValue({
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

        expect(result.response.body.message).toBe('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequestLib.get(testRoute)

        expect(result.response.statusCode).toBe(404)
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
})
