'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const LegacyRequest = require('../../../app/requests/legacy.request.js')

// Thing under test
const ViewHealthRequest = require('../../../app/requests/legacy/view-health.request.js')

describe('Legacy - View Health request', () => {
  const serviceName = 'import'

  let response

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: 200,
        body: {
          version: 'v2.36.1',
          commit: 'f6d9d43deb8d3a600fa582143e8f4e55b7e0c372'
        }
      }

      Sinon.stub(LegacyRequest, 'get').withArgs(serviceName).resolves({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest.send(serviceName)

      expect(result.succeeded).to.be.true()
    })

    it('returns the result from a Legacy service in the "response"', async () => {
      const result = await ViewHealthRequest.send(serviceName)

      expect(result.response.body).to.equal(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: 404,
          body: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found'
          }
        }

        Sinon.stub(LegacyRequest, 'get').withArgs(serviceName).resolves({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewHealthRequest.send(serviceName)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewHealthRequest.send(serviceName)

        expect(result.response.body).to.equal(response.body)
      })
    })
  })
})
