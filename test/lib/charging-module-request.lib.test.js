'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ChargingModuleTokenService = require('../../app/services/charging-module/token.service.js')
const RequestLib = require('../../app/lib/request.lib.js')

// Thing under test
const ChargingModuleRequestLib = require('../../app/lib/charging-module-request.lib.js')

describe.only('ChargingModuleRequestLib', () => {
  const testRoute = 'TEST_ROUTE'

  beforeEach(async () => {
    Sinon.stub(ChargingModuleTokenService, 'go').resolves({
      accessToken: 'ACCESS_TOKEN',
      expiresIn: 3600
    })
  })

  afterEach(() => {
    Sinon.restore()
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

      it('returns the response as an object', async () => {
        const { response } = result

        expect(response.testObject.test).to.equal('yes')
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'get').resolves({
          succeeded: false,
          response: {
            statusCode: 400,
            testError: 'TEST_ERROR'
          }
        })

        result = await ChargingModuleRequestLib.get(testRoute)
      })

      it('returns a `false` success status', async () => {
        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const { response } = result

        expect(response.testError).to.equal('TEST_ERROR')
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
            body: '{"testObject": {"test": "yes"}}'
          }
        })

        result = await ChargingModuleRequestLib.post(testRoute, { test: true })
      })

      it('calls the Charging Module with the required options', async () => {
        const requestArgs = RequestLib.post.firstCall.args

        expect(requestArgs[0]).to.endWith('/TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
        expect(requestArgs[1].json).to.include({ test: true })
      })

      it('returns a `true` success status', async () => {
        expect(result.succeeded).to.be.true()
      })

      it('returns the response as an object', async () => {
        const { response } = result

        expect(response.testObject.test).to.equal('yes')
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'post').resolves({
          succeeded: false,
          response: {
            statusCode: 400,
            testError: 'TEST_ERROR'
          }
        })

        result = await ChargingModuleRequestLib.post(testRoute, { test: true })
      })

      it('returns a `false` success status', async () => {
        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const { response } = result

        expect(response.testError).to.equal('TEST_ERROR')
      })
    })
  })
})
