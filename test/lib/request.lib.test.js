'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const requestConfig = require('../../config/request.config.js')

// Thing under test
const RequestLib = require('../../app/lib/request.lib.js')

describe('RequestLib', () => {
  const testDomain = 'http://example.com'

  afterEach(() => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('When a request succeeds', () => {
    beforeEach(() => {
      Nock(testDomain).get('/').reply(200, { data: 'hello world' })
    })

    describe('the result it returns', () => {
      it("has a 'succeeded' property marked as true", async () => {
        const result = await RequestLib.get(testDomain)

        expect(result.succeeded).to.be.true()
      })

      it("has a 'response' property containg the web response", async () => {
        const result = await RequestLib.get(testDomain)

        expect(result.response).to.exist()
        expect(result.response.statusCode).to.equal(200)
        expect(result.response.body).to.equal('{"data":"hello world"}')
      })
    })
  })

  describe('When a request fails', () => {
    describe('because the response was a 500', () => {
      beforeEach(() => {
        Nock(testDomain).get('/').reply(500, { data: 'hello world' })
      })

      describe('the result it returns', () => {
        it("has a 'succeeded' property marked as false", async () => {
          const result = await RequestLib.get(testDomain)

          expect(result.succeeded).to.be.false()
        })

        it("has a 'response' property containg the web response", async () => {
          const result = await RequestLib.get(testDomain)

          expect(result.response).to.exist()
          expect(result.response.statusCode).to.equal(500)
          expect(result.response.body).to.equal('{"data":"hello world"}')
        })
      })
    })

    describe('because there was a network issue', () => {
      beforeEach(() => {
        Nock(testDomain).get('/').replyWithError({ code: 'ECONNRESET' })
      })

      describe('the result it returns', () => {
        it("has a 'succeeded' property marked as false", async () => {
          const result = await RequestLib.get(testDomain)

          expect(result.succeeded).to.be.false()
        })

        it("has a 'response' property containg the error", async () => {
          const result = await RequestLib.get(testDomain)

          expect(result.response).to.exist()
          expect(result.response).to.be.an.error()
          expect(result.response.code).to.equal('ECONNRESET')
        })
      })
    })

    describe('because request timed out', () => {
      beforeEach(async () => {
        // Set the timeout value to 50ms for these tests
        Sinon.replace(requestConfig, 'timeout', 50)
      })

      // Because of the fake delay in this test, Lab will timeout (by default tests have 2 seconds to finish). So, we
      // have to override the timeout for this specific test to all it to complete
      describe('and all retries fail', { timeout: 5000 }, () => {
        beforeEach(async () => {
          Nock(testDomain)
            .get(() => true)
            .delay(100)
            .reply(200, { data: 'hello world' })
            .persist()
        })

        describe('the result it returns', () => {
          it("has a 'succeeded' property marked as false", async () => {
            const result = await RequestLib.get(testDomain)

            expect(result.succeeded).to.be.false()
          })

          it("has a 'response' property containg the error", async () => {
            const result = await RequestLib.get(testDomain)

            expect(result.response).to.exist()
            expect(result.response).to.be.an.error()
            expect(result.response.code).to.equal('ETIMEDOUT')
          })
        })
      })

      describe('and a retry succeeds', () => {
        beforeEach(async () => {
          // The first response will time out, the second response will return OK
          Nock(testDomain)
            .get(() => true)
            .delay(100)
            .reply(200, { data: 'hello world' })
            .get(() => true)
            .reply(200, { data: 'hello world' })
        })

        describe('the result it returns', () => {
          it("has a 'succeeded' property marked as true", async () => {
            const result = await RequestLib.get(testDomain)

            expect(result.succeeded).to.be.true()
          })

          it("has a 'response' property containg the web response", async () => {
            const result = await RequestLib.get(testDomain)

            expect(result.response).to.exist()
            expect(result.response.statusCode).to.equal(200)
            expect(result.response.body).to.equal('{"data":"hello world"}')
          })
        })
      })
    })
  })

  describe('When I provide additional options', () => {
    describe('and they expand the default options', () => {
      beforeEach(() => {
        Nock(testDomain).get('/').reply(200, { data: 'hello world' })
      })

      it('adds them to the options used when making the request', async () => {
        // We tell Got to return the response as json rather than text. We can confirm the option has been applied by
        // checking the result.reponse.body below.
        const options = { responseType: 'json' }
        const result = await RequestLib.get(testDomain, options)

        expect(result.succeeded).to.be.true()
        expect(result.response.body).to.equal({ data: 'hello world' })

      })
    })

    describe('and they replace a default option', () => {
      beforeEach(() => {
        Nock(testDomain).get('/').reply(500)
      })

      it('uses them in the options used when making the request', async () => {
        // We tell Got throw an error if the response is not 2xx or 3xx
        const options = { throwHttpErrors: true }
        const result = await RequestLib.get(testDomain, options)

        expect(result.succeeded).to.be.false()
        expect(result.response).to.be.an.error()
      })
    })
  })
})
