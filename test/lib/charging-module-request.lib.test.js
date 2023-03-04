'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const RequestLib = require('../../app/lib/request.lib.js')

// Thing under test
const ChargingModuleRequestLib = require('../../app/lib/charging-module-request.lib.js')

describe('ChargingModuleRequestLib', () => {
  const headers = {
    'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39',
    'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
  }
  const testRoute = 'TEST_ROUTE'

  before(async () => {
    // ChargingModuleRequestLib makes use of the getChargingModuleToken() server method, which we therefore need to stub
    // Note that we only need to do this once as it is unaffected by the Sinon.restore() in our afterEach()
    global.HapiServerMethods = {
      getChargingModuleToken: Sinon.stub().resolves({
        accessToken: 'ACCESS_TOKEN',
        expiresIn: 3600
      })
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(() => {
    // Tidy up our global server methods stub once done
    delete global.HapiServerMethods
  })

  describe('#get', () => {
    let result

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'get').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: 200,
            body: { testObject: { test: 'yes' } }
          }
        })

        result = await ChargingModuleRequestLib.get(testRoute)
      })

      it('calls the Charging Module with the required options', async () => {
        const requestArgs = RequestLib.get.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('returns a `true` success status', async () => {
        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        expect(result.response.body.testObject.test).to.equal('yes')
      })

      it('returns the status code', async () => {
        expect(result.response.statusCode).to.equal(200)
      })

      it('returns the information about the running Charging Module API', async () => {
        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'get').resolves({
          succeeded: false,
          response: {
            headers,
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })

        result = await ChargingModuleRequestLib.get(testRoute)
      })

      it('returns a `false` success status', async () => {
        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        expect(result.response.statusCode).to.equal(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })

  describe('#patch', () => {
    let result

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'patch').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: 204,
            body: {}
          }
        })

        result = await ChargingModuleRequestLib.patch(testRoute)
      })

      it('calls the Charging Module with the required options', async () => {
        const requestArgs = RequestLib.patch.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('returns a `true` success status', async () => {
        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        expect(result.response.body).to.equal({})
      })

      it('returns the status code', async () => {
        expect(result.response.statusCode).to.equal(204)
      })

      it('returns the information about the running Charging Module API', async () => {
        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'patch').resolves({
          succeeded: false,
          response: {
            headers,
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })

        result = await ChargingModuleRequestLib.patch(testRoute)
      })

      it('returns a `false` success status', async () => {
        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        expect(result.response.statusCode).to.equal(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })

  describe('#post', () => {
    let result

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'post').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: 200,
            body: { testObject: { test: 'yes' } }
          }
        })

        result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })
      })

      it('calls the Charging Module with the required options', async () => {
        const requestArgs = RequestLib.post.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
        expect(requestArgs[1].json).to.equal({ test: 'yes' })
      })

      it('returns a `true` success status', async () => {
        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        expect(result.response.body.testObject.test).to.equal('yes')
      })

      it('returns the status code', async () => {
        expect(result.response.statusCode).to.equal(200)
      })

      it('returns the information about the running Charging Module API', async () => {
        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'post').resolves({
          succeeded: false,
          response: {
            headers,
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })

        result = await ChargingModuleRequestLib.post(testRoute, { test: true })
      })

      it('returns a `false` success status', async () => {
        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        expect(result.response.statusCode).to.equal(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })
})
