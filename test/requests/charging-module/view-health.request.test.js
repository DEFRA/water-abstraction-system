'use strict'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ChargingModuleRequest = require('../../../app/requests/charging-module.request.js')

// Thing under test
const ViewHealthRequest = require('../../../app/requests/charging-module/view-health.request.js')

describe('Charging Module - View Health request', () => {
  let response

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: HTTP_STATUS_OK,
        body: { status: 'alive' }
      }

      Sinon.stub(ChargingModuleRequest, 'get').resolves({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.succeeded).to.be.true()
    })

    it('returns the result from the Charging Module in the "response"', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.response.body).to.equal(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: HTTP_STATUS_NOT_FOUND,
          body: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            error: 'Not Found',
            message: 'Not Found'
          }
        }

        Sinon.stub(ChargingModuleRequest, 'get').resolves({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewHealthRequest.send()

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewHealthRequest.send()

        expect(result.response.body).to.equal(response.body)
      })
    })
  })
})
