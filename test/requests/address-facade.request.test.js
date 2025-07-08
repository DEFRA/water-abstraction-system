'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, after, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const requestConfig = require('../../config/request.config.js')
const BaseRequest = require('../../app/requests/base.request.js')

// Thing under test
const AddressFacadeRequest = require('../../app/requests/address-facade.request.js')

describe('Requests - Address Facade request', () => {
  const headers = {
    'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39',
    'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
  }
  const testRoute = 'TEST_ROUTE'

  beforeEach(() => {
    // Set the timeout value to 500ms for these tests. We don't trigger a timeout but we do test that the module
    // uses it when making a request
    Sinon.replace(requestConfig, 'timeout', 500)
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(() => {
    // Tidy up our global server methods stub once done
    delete global.HapiServerMethods
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { results: [] }
          }
        })
      })

      it('calls the Address Facade with the required options', async () => {
        await AddressFacadeRequest.get(testRoute)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
      })

      it('uses the request timeout config', async () => {
        await AddressFacadeRequest.get(testRoute)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[1].timeout).to.equal({ request: 500 })
      })

      it('returns a "true" success status', async () => {
        const result = await AddressFacadeRequest.get(testRoute)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await AddressFacadeRequest.get(testRoute)

        expect(result.response.body.results).to.exist()
      })

      it('returns the status code', async () => {
        const result = await AddressFacadeRequest.get(testRoute)

        expect(result.response.statusCode).to.equal(200)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: false,
          response: {
            headers,
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await AddressFacadeRequest.get(testRoute)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await AddressFacadeRequest.get(testRoute)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await AddressFacadeRequest.get(testRoute)

        expect(result.response.statusCode).to.equal(404)
      })
    })
  })
})
