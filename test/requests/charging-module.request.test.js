'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const requestConfig = require('../../config/request.config.js')
const BaseRequest = require('../../app/requests/base.request.js')

// Thing under test
const ChargingModuleRequest = require('../../app/requests/charging-module.request.js')

describe('Charging Module Request', () => {
  const headers = {
    'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39',
    'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
  }
  const testRoute = 'TEST_ROUTE'

  before(async () => {
    // ChargingModuleRequest makes use of the getChargingModuleToken() server method, which we therefore need to stub
    // Note that we only need to do this once as it is unaffected by the Sinon.restore() in our afterEach()
    global.HapiServerMethods = {
      getChargingModuleToken: Sinon.stub().resolves({
        accessToken: 'ACCESS_TOKEN',
        expiresIn: 3600
      })
    }
  })

  beforeEach(() => {
    // Set the timeout value to 1234ms for these tests. We don't trigger a timeout but we do test that the module
    // uses it when making a request to the charging module, rather than the default request timeout config value
    Sinon.replace(requestConfig, 'chargingModuleTimeout', 1234)
    Sinon.replace(requestConfig, 'timeout', 1000)
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(() => {
    // Tidy up our global server methods stub once done
    delete global.HapiServerMethods
  })

  describe('#delete', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'delete').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: 204,
            body: {}
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequest.delete(testRoute)

        const requestArgs = BaseRequest.delete.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('uses the charging module timeout', async () => {
        await ChargingModuleRequest.delete(testRoute)

        const requestArgs = BaseRequest.delete.firstCall.args

        expect(requestArgs[1].timeout).to.equal({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleRequest.delete(testRoute)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequest.delete(testRoute)

        expect(result.response.body).to.equal({})
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.delete(testRoute)

        expect(result.response.statusCode).to.equal(204)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.delete(testRoute)

        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'delete').resolves({
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
        const result = await ChargingModuleRequest.delete(testRoute)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequest.delete(testRoute)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.delete(testRoute)

        expect(result.response.statusCode).to.equal(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.delete(testRoute)

        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: 200,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequest.get(testRoute)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('uses the charging module timeout', async () => {
        await ChargingModuleRequest.get(testRoute)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[1].timeout).to.equal({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleRequest.get(testRoute)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequest.get(testRoute)

        expect(result.response.body.testObject.test).to.equal('yes')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.get(testRoute)

        expect(result.response.statusCode).to.equal(200)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.get(testRoute)

        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
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
        const result = await ChargingModuleRequest.get(testRoute)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequest.get(testRoute)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.get(testRoute)

        expect(result.response.statusCode).to.equal(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.get(testRoute)

        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })

  describe('#patch', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'patch').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: 204,
            body: {}
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequest.patch(testRoute)

        const requestArgs = BaseRequest.patch.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('uses the charging module timeout', async () => {
        await ChargingModuleRequest.patch(testRoute)

        const requestArgs = BaseRequest.patch.firstCall.args

        expect(requestArgs[1].timeout).to.equal({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleRequest.patch(testRoute)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequest.patch(testRoute)

        expect(result.response.body).to.equal({})
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.patch(testRoute)

        expect(result.response.statusCode).to.equal(204)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.patch(testRoute)

        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'patch').resolves({
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
        const result = await ChargingModuleRequest.patch(testRoute)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequest.patch(testRoute)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.patch(testRoute)

        expect(result.response.statusCode).to.equal(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.patch(testRoute)

        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })

  describe('#post', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'post').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: 200,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls the Charging Module with the required options', async () => {
        await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
        expect(requestArgs[1].json).to.equal({ test: 'yes' })
      })

      it('uses the charging module timeout', async () => {
        await ChargingModuleRequest.post(testRoute)

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[1].timeout).to.equal({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        expect(result.response.body.testObject.test).to.equal('yes')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        expect(result.response.statusCode).to.equal(200)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'post').resolves({
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
        const result = await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        expect(result.response.statusCode).to.equal(404)
      })

      it('returns the information about the running Charging Module API', async () => {
        const result = await ChargingModuleRequest.post(testRoute, { test: 'yes' })

        expect(result.response.info).to.equal({
          gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
          dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
        })
      })
    })
  })
})
