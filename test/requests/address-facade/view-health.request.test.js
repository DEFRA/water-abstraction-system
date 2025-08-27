'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const addressFacadeConfig = require('../../../config/address-facade.config.js')
const BaseRequest = require('../../../app/requests/base.request.js')

// Thing under test
const ViewHealthRequest = require('../../../app/requests/address-facade/view-health.request.js')

describe('Address Facade - View Health request', () => {
  let response

  beforeEach(() => {
    Sinon.stub(addressFacadeConfig, 'url').value('http://localhost:8009')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: 200,
        body: 'hola'
      }

      Sinon.stub(BaseRequest, 'get')
        .withArgs('http://localhost:8009/address-service/hola', { responseType: 'text' })
        .resolves({
          succeeded: true,
          response
        })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.succeeded).to.be.true()
    })

    it('returns the result from the Address Facade in the "response"', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.response.body).to.equal(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: 404,
          body: {
            facade_status_code: 404,
            facade_error_message: 'HTTP 404 Not Found',
            facade_error_code: 'address_service_error_11',
            supplier_was_called: null,
            supplier_status_code: null,
            supplier_response: null
          }
        }

        Sinon.stub(BaseRequest, 'get')
          .withArgs('http://localhost:8009/address-service/hola', { responseType: 'text' })
          .resolves({
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
