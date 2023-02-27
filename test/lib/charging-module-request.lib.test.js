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
            statusCode: 200,
            body: '{"testObject": {"test": "yes"}}'
          }
        })

        result = await ChargingModuleRequestLib.get(testRoute)
      })

      it('calls the Charging Module with the required options', async () => {
        const requestArgs = RequestLib.get.firstCall.args

        expect(requestArgs[0]).to.endWith('/TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
      })

      it('returns a `true` success status', async () => {
        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        expect(result.response.body.testObject.test).to.equal('yes')
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'get').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: '{"statusCode":404,"error":"Not Found","message":"Not Found"}'
          }
        })

        result = await ChargingModuleRequestLib.get(testRoute)
      })

      it('returns a `false` success status', async () => {
        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        expect(result.response.statusMessage).to.equal('Not Found')
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
            statusCode: 200,
            statusMessage: 'OK',
            body: '{"testObject": {"test":"yes"}}'
          }
        })

        result = await ChargingModuleRequestLib.post(testRoute, { test: 'yes' })
      })

      it('calls the Charging Module with the required options', async () => {
        const requestArgs = RequestLib.post.firstCall.args

        expect(requestArgs[0]).to.endWith('/TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
        expect(requestArgs[1].body).to.equal('{"test":"yes"}')
      })

      it('returns a `true` success status', async () => {
        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        expect(result.response.body.testObject.test).to.equal('yes')
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'post').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: '{"statusCode":404,"error":"Not Found","message":"Not Found"}'
          }
        })

        result = await ChargingModuleRequestLib.post(testRoute, { test: true })
      })

      it('returns a `false` success status', async () => {
        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        expect(result.response.statusMessage).to.equal('Not Found')
      })
    })
  })
})
