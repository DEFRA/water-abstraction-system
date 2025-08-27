'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const GotenbergRequest = require('../../../app/requests/gotenberg.request.js')

// Thing under test
const ViewHealthRequest = require('../../../app/requests/gotenberg/view-health.request.js')

describe('Gotenberg - View Health request', () => {
  let response

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: 200,
        body: {
          status: 'up',
          details: {
            chromium: {
              status: 'up',
              timestamp: '2025-08-26T23:21:08.772604834Z'
            },
            libreoffice: {
              status: 'up',
              timestamp: '2025-08-26T23:21:08.772586125Z'
            }
          }
        }
      }

      Sinon.stub(GotenbergRequest, 'get').resolves({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.succeeded).to.be.true()
    })

    it('returns the result from Gotenberg in the "response"', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.response.body).to.equal(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: 404,
          body: 'Not Found'
        }

        Sinon.stub(GotenbergRequest, 'get').resolves({
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
