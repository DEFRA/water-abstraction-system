'use strict'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const BaseRequest = require('../../app/requests/base.request.js')
const gotenbergConfig = require('../../config/gotenberg.config.js')
const serverConfig = require('../../config/server.config.js')

// Thing under test
const GotenbergRequest = require('../../app/requests/gotenberg.request.js')

describe('Gotenberg Request', () => {
  const headers = {}
  const testRoute = 'TEST_ROUTE'

  let formData
  let bodyAsBuffer
  let bodyAsUint8Array

  beforeEach(() => {
    // Set delay to a value that won't cause the tests to timeout or run needlessly slow. By default it's 2 seconds.
    Sinon.stub(gotenbergConfig, 'delay').value(25)
    // Set the timeout value to 1234ms for these tests. We don't trigger a timeout but we do test that the module
    // uses it when making a request to the charging module, rather than the default request timeout config value
    Sinon.stub(gotenbergConfig, 'timeout').value(1234)
    Sinon.stub(serverConfig, 'requestTimeout').value(1000)

    formData = new FormData()
    formData.append('index.html', new Blob([Buffer.from('<p>Test</p>')]), 'index.html')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#post', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        // Got returns the body as an Uint8Array which this emulates by encoding our test PDF string as an Uint8Array.
        // This is what we tell the BaseRequest stub to return
        bodyAsUint8Array = new TextEncoder().encode('%PDF-1.4\n%âãÏÓ\n')

        // This is what we expect the GotenbergRequest module to return after it casts the Uint8Array to a Node buffer
        bodyAsBuffer = Buffer.from(bodyAsUint8Array)

        Sinon.stub(BaseRequest, 'post').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: HTTP_STATUS_OK,
            body: bodyAsUint8Array
          }
        })
      })

      it('calls Gotenberg with the required options', async () => {
        await GotenbergRequest.post(testRoute, formData)

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].responseType).to.equal('buffer')
        expect(requestArgs[1].body).to.equal(formData)
      })

      it('uses the Gotenberg timeout', async () => {
        await GotenbergRequest.post(testRoute, formData)

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[1].timeout).to.equal({ request: 1234 })
      })

      it('returns a "true" success status', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an array buffer', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.response.body).to.equal(bodyAsBuffer)
      })

      it('returns the status code', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.response.statusCode).to.equal(HTTP_STATUS_OK)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        // If Gotenberg returns a 4xx or 5xx response it will return a message as text rather than the PDF as bytes. Got
        // still encodes the body as a Uint8Array. So, we cater for this in _parseResult() by checking the status code
        // and only casting to a buffer if it's a 200. This is what we emulate here by encoding a string as an
        // Uint8Array and then telling the BaseRequest stub to return it.
        bodyAsUint8Array = new TextEncoder().encode('Not found')

        Sinon.stub(BaseRequest, 'post').resolves({
          succeeded: false,
          response: {
            headers,
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: 'Not Found'
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.response.body).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.response.statusCode).to.equal(HTTP_STATUS_NOT_FOUND)
      })
    })
  })
})
