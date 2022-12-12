'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Nock = require('nock')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent')

// Things we need to stub
const requireConfig = require('../../config/request.config.js')

// Thing under test
const HttpRequestService = require('../../app/services/http-request.service.js')

describe('Service Status service', () => {
  const testDomain = 'https://example.com'

  afterEach(() => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('when the request is succeeds', () => {
    beforeEach(async () => {
      Nock(testDomain).get(() => true).reply(200, 'Example domain')
    })

    it('returns a result flagged as succeeded which includes the full response', async () => {
      const result = await HttpRequestService.go(testDomain)

      expect(result.succeeded).to.be.true()
      expect(result.response.body).to.equal('Example domain')
      expect(result.response.statusCode).to.equal(200)
    })
  })

  describe('when the request fails', () => {
    describe('because of a network error', () => {
      beforeEach(async () => {
        Nock(testDomain).get(() => true).replyWithError({ code: 'ECONNRESET' })
      })

      it('returns a result flagged as failed where the response is the error thrown', async () => {
        const result = await HttpRequestService.go(testDomain)

        expect(result.succeeded).to.be.false()
        expect(result.response).to.be.an.error()
        expect(result.response.code).to.equal('ECONNRESET')
      })
    })

    describe('because the page is not found', () => {
      beforeEach(async () => {
        Nock(testDomain).get(() => true).reply(404)
      })

      it('returns a result flagged as failed which includes the full response', async () => {
        const result = await HttpRequestService.go(testDomain)

        expect(result.succeeded).to.be.false()
        expect(result.response.statusCode).to.equal(404)
      })
    })

    describe('because the web service threw an error', () => {
      beforeEach(async () => {
        Nock(testDomain).get(() => true).reply(500)
      })

      it('returns a result flagged as failed which includes the full response', async () => {
        const result = await HttpRequestService.go(testDomain)

        expect(result.succeeded).to.be.false()
        expect(result.response.statusCode).to.equal(500)
      })
    })
  })

  describe('when the request times out', () => {
    beforeEach(async () => {
      // Set the timeout value to 50ms for these tests
      Sinon.replace(requireConfig, 'requestTimeout', 50)
    })

    describe('and all retries fail', { timeout: 5000 }, () => {
      beforeEach(async () => {
        Nock(testDomain)
          .get(() => true)
          .delay(100)
          .reply(200)
          .persist()
      })

      it('returns a result flagged as failed where the response is the error thrown', async () => {
        const result = await HttpRequestService.go(testDomain)

        expect(result.succeeded).to.be.false()
        expect(result.response).to.be.an.error()
        expect(result.response.code).to.equal('ETIMEDOUT')
      })
    })

    describe('and a retry succeeds', () => {
      beforeEach(async () => {
        // The first response will time out, the second response will return OK
        Nock(testDomain)
          .get(() => true)
          .delay(100)
          .reply(200, 'Example domain')
          .get(() => true)
          .reply(200, 'Example domain')
      })

      it('returns a result flagged as succeeded which includes the full response', async () => {
        const result = await HttpRequestService.go(testDomain)

        expect(result.succeeded).to.be.true()
        expect(result.response.body).to.equal('Example domain')
        expect(result.response.statusCode).to.equal(200)
      })
    })
  })

  // TODO: Now _requestAgent() is not a function we export (or want to export) on the module how do we go about
  // verifying the behaviour of the app when its behind a proxy. We opted for spying on our own function because we
  // struggled to stub/spy anything on hpagent
  describe.skip('when the request is behind a proxy', () => {
    let proxySpy

    beforeEach(async () => {
      Sinon.stub(requireConfig, 'httpProxy').value('http://myproxy')
    })

    describe('and it is to a https address', () => {
      beforeEach(async () => {
        proxySpy = Sinon.spy(HttpRequestService, '_requestAgent')

        Nock(testDomain).get(() => true).reply(200, 'Example domain')
      })

      it('returns a succesful result using the HttpsProxyAgent', async () => {
        const result = await HttpRequestService.go(testDomain)

        expect(result.succeeded).to.be.true()
        expect(result.response.body).to.equal('Example domain')
        expect(result.response.statusCode).to.equal(200)
        expect(proxySpy.called).to.be.true()
        expect(proxySpy.returnValues[0]).to.be.instanceOf(HttpsProxyAgent)
      })
    })

    describe('and it is to a http address', () => {
      beforeEach(async () => {
        proxySpy = Sinon.spy(HttpRequestService, '_requestAgent')

        Nock('http://example.com').get(() => true).reply(200, 'Example domain')
      })

      it('returns a succesful result using the HttpProxyAgent', async () => {
        const result = await HttpRequestService.go('http://example.com')

        expect(result.succeeded).to.be.true()
        expect(result.response.body).to.equal('Example domain')
        expect(result.response.statusCode).to.equal(200)
        expect(proxySpy.called).to.be.true()
        expect(proxySpy.returnValues[0]).to.be.instanceOf(HttpProxyAgent)
      })
    })
  })
})
