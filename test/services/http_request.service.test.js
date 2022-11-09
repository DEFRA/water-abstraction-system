'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Nock = require('nock')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const HttpRequestService = require('../../app/services/http_request.service.js')

describe('Service Status service', () => {
  const testDomain = 'https://example.com'

  afterEach(() => {
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
        const { RequestError } = await import('got')

        const result = await HttpRequestService.go(testDomain)

        expect(result.succeeded).to.be.false()
        expect(result.response.code).to.equal('ECONNRESET')
        expect(result.response).to.be.an.instanceOf(RequestError)
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
})
