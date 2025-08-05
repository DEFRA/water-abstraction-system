'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const BaseRequest = require('../../app/requests/base.request.js')
const requestConfig = require('../../config/request.config.js')

// Thing under test
const GotenbergRequest = require('../../app/requests/gotenberg.request.js')

describe('Gotenberg Request', () => {
  const headers = {}
  const testRoute = 'TEST_ROUTE'

  let formData
  let pdfBytes

  beforeEach(() => {
    // Set the timeout value to 1234ms for these tests. We don't trigger a timeout but we do test that the module
    // uses it when making a request to the charging module, rather than the default request timeout config value
    Sinon.replace(requestConfig, 'gotenbergTimeout', 1234)
    Sinon.replace(requestConfig, 'timeout', 1000)

    formData = new FormData()
    formData.append('index.html', new Blob([Buffer.from('<p>Test</p>')]), 'index.html')

    pdfBytes = new TextEncoder().encode('%PDF-1.4\n%âãÏÓ\n').buffer
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#post', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'post').resolves({
          succeeded: true,
          response: {
            headers,
            statusCode: 200,
            body: pdfBytes
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

        expect(result.response.body).to.equal(pdfBytes)
      })

      it('returns the status code', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.response.statusCode).to.equal(200)
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
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await GotenbergRequest.post(testRoute, formData)

        expect(result.response.statusCode).to.equal(404)
      })
    })
  })
})
