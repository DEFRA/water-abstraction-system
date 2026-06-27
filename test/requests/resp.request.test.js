'use strict'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const BaseRequest = require('../../app/requests/base.request.js')

// Thing under test
const RespRequest = require('../../app/requests/resp.request.js')

describe('ReSP API Request', () => {
  const testRoute = 'TEST_ROUTE'

  beforeAll(() => {
    // RespRequest makes use of the getRespToken() server method, which we therefore need to stub
    // Note that we only need to do this once as it is unaffected by the Sinon.restore() in our afterEach()
    globalThis.HapiServerMethods = {
      getRespToken: Sinon.stub().resolves({
        accessToken: 'ACCESS_TOKEN',
        expiresIn: 3600
      })
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  afterAll(() => {
    // Tidy up our global server methods stub once done
    delete globalThis.HapiServerMethods
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(() => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls the ReSP API with the required options', async () => {
        await RespRequest.get(testRoute)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('returns a "true" success status', async () => {
        const result = await RespRequest.get(testRoute)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await RespRequest.get(testRoute)

        expect(result.response.body.testObject.test).toEqual('yes')
      })

      it('returns the status code', async () => {
        const result = await RespRequest.get(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })
    })

    describe('when the request fails', () => {
      beforeEach(() => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await RespRequest.get(testRoute)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await RespRequest.get(testRoute)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await RespRequest.get(testRoute)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })
    })
  })
})
