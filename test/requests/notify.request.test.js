'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const BaseRequest = require('../../app/requests/base.request.js')
const notifyConfig = require('../../config/notify.config.js')
const serverConfig = require('../../config/server.config.js')

// Thing under test
const NotifyRequest = require('../../app/requests/notify.request.js')

describe('Notify Request', () => {
  const testRoute = 'TEST_ROUTE'

  before(async () => {
    // NotifyRequest makes use of the getNotifyToken() server method, which we therefore need to stub.
    // Note that we only need to do this once as it is unaffected by the Sinon.restore() in our afterEach()
    global.HapiServerMethods = {
      getNotifyToken: Sinon.stub().resolves('ACCESS_TOKEN')
    }
  })

  beforeEach(() => {
    // Set the timeout value to 1234ms for these tests. We don't trigger a timeout but we do test that the module
    // uses it when making a request to the charging module, rather than the default request timeout config value
    Sinon.stub(notifyConfig, 'timeout').value(1234)
    Sinon.stub(serverConfig, 'requestTimeout').value(1000)
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
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls Notify with the required options', async () => {
        await NotifyRequest.get(testRoute)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('uses the notify timeout', async () => {
        await NotifyRequest.get(testRoute)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[1].timeout).to.equal({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await NotifyRequest.get(testRoute)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await NotifyRequest.get(testRoute)

        expect(result.response.body.testObject.test).to.equal('yes')
      })

      it('returns the status code', async () => {
        const result = await NotifyRequest.get(testRoute)

        expect(result.response.statusCode).to.equal(200)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await NotifyRequest.get(testRoute)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await NotifyRequest.get(testRoute)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await NotifyRequest.get(testRoute)

        expect(result.response.statusCode).to.equal(404)
      })
    })
  })

  describe('#post', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'post').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { testObject: { test: 'yes' } }
          }
        })
      })

      it('calls Notify with the required options', async () => {
        await NotifyRequest.post(testRoute, { test: 'yes' })

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
        expect(requestArgs[1].json).to.equal({ test: 'yes' })
      })

      it('uses the Notify timeout', async () => {
        await NotifyRequest.post(testRoute)

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[1].timeout).to.equal({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await NotifyRequest.post(testRoute, { test: 'yes' })

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await NotifyRequest.post(testRoute, { test: 'yes' })

        expect(result.response.body.testObject.test).to.equal('yes')
      })

      it('returns the status code', async () => {
        const result = await NotifyRequest.post(testRoute, { test: 'yes' })

        expect(result.response.statusCode).to.equal(200)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'post').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await NotifyRequest.post(testRoute, { test: 'yes' })

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await NotifyRequest.post(testRoute, { test: 'yes' })

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await NotifyRequest.post(testRoute, { test: 'yes' })

        expect(result.response.statusCode).to.equal(404)
      })
    })
  })
})
