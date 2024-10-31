'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const requestConfig = require('../../config/request.config.js')

// Thing under test
const BaseRequest = require('../../app/requests/base.request.js')

describe('Base Request', () => {
  const testDomain = 'http://example.com'

  // NOTE: We make the tests run much faster by setting backoffLimit to 50 in Got's retry options. The time between
  // retries in Got is based on a computed value; ((2 ** (attemptCount - 1)) * 1000) + noise
  //
  // This means the delay increases exponentially between retries. That's great when making requests for real but it
  // drastically slows down our test suite. Prior to making this change the tests for this module took an avg of 40 secs
  // to finish. The backoffLimit sets an upper limit for the computed value. When applied here it brings the avg down
  // to 16 secs.
  //
  // The behaviour doesn't change; we are still retrying requests. But now we are only waiting a maximum of 50ms between
  // them.
  const shortBackoffLimitRetryOptions = {
    ...BaseRequest.defaultOptions.retry,
    backoffLimit: 50
  }

  let notifierStub

  beforeEach(() => {
    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    Nock.cleanAll()
    delete global.GlobalNotifier
  })

  describe('#delete()', () => {
    describe('When a request succeeds', () => {
      beforeEach(() => {
        Nock(testDomain).delete('/').reply(200, { data: 'hello world' })
      })

      describe('the result it returns', () => {
        it('has a "succeeded" property marked as true', async () => {
          const result = await BaseRequest.delete(testDomain)

          expect(result.succeeded).to.be.true()
        })

        it('has a "response" property containing the web response', async () => {
          const result = await BaseRequest.delete(testDomain)

          expect(result.response).to.exist()
          expect(result.response.statusCode).to.equal(200)
          expect(result.response.body).to.equal('{"data":"hello world"}')
        })
      })
    })

    describe('When a request fails', () => {
      describe('because the response was a 500', () => {
        beforeEach(() => {
          Nock(testDomain).delete('/').reply(500, { data: 'hello world' })
        })

        it('logs the failure', async () => {
          await BaseRequest.delete(testDomain)

          const logDataArg = notifierStub.omg.args[0][1]

          expect(notifierStub.omg.calledWith('DELETE request failed')).to.be.true()
          expect(logDataArg.method).to.equal('DELETE')
          expect(logDataArg.url).to.equal('http://example.com')
          expect(logDataArg.additionalOptions).to.equal({})
          expect(logDataArg.result.succeeded).to.be.false()
          expect(logDataArg.result.response).to.equal({
            statusCode: 500,
            body: '{"data":"hello world"}'
          })
        })

        describe('the result it returns', () => {
          it('has a "succeeded" property marked as false', async () => {
            const result = await BaseRequest.delete(testDomain)

            expect(result.succeeded).to.be.false()
          })

          it('has a "response" property containing the web response', async () => {
            const result = await BaseRequest.delete(testDomain)

            expect(result.response).to.exist()
            expect(result.response.statusCode).to.equal(500)
            expect(result.response.body).to.equal('{"data":"hello world"}')
          })
        })
      })

      describe('because there was a network issue', () => {
        describe('and all retries fail', () => {
          beforeEach(async () => {
            Nock(testDomain)
              .delete(() => {
                return true
              })
              .replyWithError({ code: 'ECONNRESET' })
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(2)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          it('logs and records the error', async () => {
            await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.args[0][1]

            expect(notifierStub.omfg.calledWith('DELETE request errored')).to.be.true()
            expect(logDataArg.method).to.equal('DELETE')
            expect(logDataArg.url).to.equal('http://example.com')
            expect(logDataArg.additionalOptions).to.exist()
            expect(logDataArg.result.succeeded).to.be.false()
            expect(logDataArg.result.response).to.be.an.error()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.false()
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response).to.be.an.error()
              expect(result.response.code).to.equal('ECONNRESET')
            })
          })
        })

        describe('and a retry succeeds', () => {
          beforeEach(async () => {
            // The first response will error, the second response will return OK
            Nock(testDomain)
              .delete(() => {
                return true
              })
              .replyWithError({ code: 'ECONNRESET' })
              .delete(() => {
                return true
              })
              .reply(200, { data: 'econnreset hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(1)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.true()
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response.statusCode).to.equal(200)
              expect(result.response.body).to.equal('{"data":"econnreset hello world"}')
            })
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
              .delete(() => {
                return true
              })
              .delay(100)
              .reply(200, { data: 'hello world' })
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(2)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          it('logs and records the error', async () => {
            await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.args[0][1]

            expect(notifierStub.omfg.calledWith('DELETE request errored')).to.be.true()
            expect(logDataArg.method).to.equal('DELETE')
            expect(logDataArg.url).to.equal('http://example.com')
            expect(logDataArg.additionalOptions).to.exist()
            expect(logDataArg.result.succeeded).to.be.false()
            expect(logDataArg.result.response).to.be.an.error()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.false()
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

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
              .delete(() => {
                return true
              })
              .delay(100)
              .reply(200, { data: 'hello world' })
              .delete(() => {
                return true
              })
              .reply(200, { data: 'delayed hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(1)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.true()
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.delete(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response.statusCode).to.equal(200)
              expect(result.response.body).to.equal('{"data":"delayed hello world"}')
            })
          })
        })
      })
    })

    describe('When I provide additional options', () => {
      describe('and they expand the default options', () => {
        beforeEach(() => {
          Nock(testDomain).delete('/').reply(200, { data: 'hello world' })
        })

        it('adds them to the options used when making the request', async () => {
          // We tell Got to return the response as json rather than text. We can confirm the option has been applied by
          // checking the result.response.body below.
          const options = { responseType: 'json' }
          const result = await BaseRequest.delete(testDomain, options)

          expect(result.succeeded).to.be.true()
          expect(result.response.body).to.equal({ data: 'hello world' })
        })
      })

      describe('and they replace a default option', () => {
        beforeEach(() => {
          Nock(testDomain).delete('/').reply(500)
        })

        it('uses them in the options used when making the request', async () => {
          // We tell Got throw an error if the response is not 2xx or 3xx
          const options = { throwHttpErrors: true }
          const result = await BaseRequest.delete(testDomain, options)

          expect(result.succeeded).to.be.false()
          expect(result.response).to.be.an.error()
        })
      })
    })
  })

  describe('#get()', () => {
    describe('When a request succeeds', () => {
      beforeEach(() => {
        Nock(testDomain).get('/').reply(200, { data: 'hello world' })
      })

      describe('the result it returns', () => {
        it('has a "succeeded" property marked as true', async () => {
          const result = await BaseRequest.get(testDomain)

          expect(result.succeeded).to.be.true()
        })

        it('has a "response" property containing the web response', async () => {
          const result = await BaseRequest.get(testDomain)

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

        it('logs the failure', async () => {
          await BaseRequest.get(testDomain)

          const logDataArg = notifierStub.omg.args[0][1]

          expect(notifierStub.omg.calledWith('GET request failed')).to.be.true()
          expect(logDataArg.method).to.equal('GET')
          expect(logDataArg.url).to.equal('http://example.com')
          expect(logDataArg.additionalOptions).to.equal({})
          expect(logDataArg.result.succeeded).to.be.false()
          expect(logDataArg.result.response).to.equal({
            statusCode: 500,
            body: '{"data":"hello world"}'
          })
        })

        describe('the result it returns', () => {
          it('has a "succeeded" property marked as false', async () => {
            const result = await BaseRequest.get(testDomain)

            expect(result.succeeded).to.be.false()
          })

          it('has a "response" property containing the web response', async () => {
            const result = await BaseRequest.get(testDomain)

            expect(result.response).to.exist()
            expect(result.response.statusCode).to.equal(500)
            expect(result.response.body).to.equal('{"data":"hello world"}')
          })
        })
      })

      describe('because there was a network issue', () => {
        describe('and all retries fail', () => {
          beforeEach(async () => {
            Nock(testDomain)
              .get(() => {
                return true
              })
              .replyWithError({ code: 'ECONNRESET' })
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(2)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          it('logs and records the error', async () => {
            await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.args[0][1]

            expect(notifierStub.omfg.calledWith('GET request errored')).to.be.true()
            expect(logDataArg.method).to.equal('GET')
            expect(logDataArg.url).to.equal('http://example.com')
            expect(logDataArg.additionalOptions).to.exist()
            expect(logDataArg.result.succeeded).to.be.false()
            expect(logDataArg.result.response).to.be.an.error()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.false()
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response).to.be.an.error()
              expect(result.response.code).to.equal('ECONNRESET')
            })
          })
        })

        describe('and a retry succeeds', () => {
          beforeEach(async () => {
            // The first response will error, the second response will return OK
            Nock(testDomain)
              .get(() => {
                return true
              })
              .replyWithError({ code: 'ECONNRESET' })
              .get(() => {
                return true
              })
              .reply(200, { data: 'econnreset hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(1)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.true()
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response.statusCode).to.equal(200)
              expect(result.response.body).to.equal('{"data":"econnreset hello world"}')
            })
          })
        })
      })

      describe('because request timed out', () => {
        beforeEach(async () => {
          // Set the timeout value to 50ms for these tests
          Sinon.replace(requestConfig, 'timeout', 50)
        })

        // Because of the fake delay in this test, Lab will timeout (by default tests have 2 seconds to finish). So, we
        // have to override the timeout for this specific test to allow it to complete
        describe('and all retries fail', { timeout: 5000 }, () => {
          beforeEach(async () => {
            Nock(testDomain)
              .get(() => {
                return true
              })
              .delay(100)
              .reply(200, { data: 'hello world' })
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(2)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          it('logs and records the error', async () => {
            await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.args[0][1]

            expect(notifierStub.omfg.calledWith('GET request errored')).to.be.true()
            expect(logDataArg.method).to.equal('GET')
            expect(logDataArg.url).to.equal('http://example.com')
            expect(logDataArg.additionalOptions).to.exist()
            expect(logDataArg.result.succeeded).to.be.false()
            expect(logDataArg.result.response).to.be.an.error()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.false()
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

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
              .get(() => {
                return true
              })
              .delay(100)
              .reply(200, { data: 'hello world' })
              .get(() => {
                return true
              })
              .reply(200, { data: 'delayed hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(1)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.true()
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.get(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response.statusCode).to.equal(200)
              expect(result.response.body).to.equal('{"data":"delayed hello world"}')
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
          // checking the result.response.body below.
          const options = { responseType: 'json' }
          const result = await BaseRequest.get(testDomain, options)

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
          const result = await BaseRequest.get(testDomain, options)

          expect(result.succeeded).to.be.false()
          expect(result.response).to.be.an.error()
        })
      })
    })
  })

  describe('#patch()', () => {
    describe('When a request succeeds', () => {
      beforeEach(() => {
        Nock(testDomain).patch('/').reply(200, { data: 'hello world' })
      })

      describe('the result it returns', () => {
        it('has a "succeeded" property marked as true', async () => {
          const result = await BaseRequest.patch(testDomain)

          expect(result.succeeded).to.be.true()
        })

        it('has a "response" property containing the web response', async () => {
          const result = await BaseRequest.patch(testDomain)

          expect(result.response).to.exist()
          expect(result.response.statusCode).to.equal(200)
          expect(result.response.body).to.equal('{"data":"hello world"}')
        })
      })
    })

    describe('When a request fails', () => {
      describe('because the response was a 500', () => {
        beforeEach(() => {
          Nock(testDomain).patch('/').reply(500, { data: 'hello world' })
        })

        it('logs the failure', async () => {
          await BaseRequest.patch(testDomain)

          const logDataArg = notifierStub.omg.args[0][1]

          expect(notifierStub.omg.calledWith('PATCH request failed')).to.be.true()
          expect(logDataArg.method).to.equal('PATCH')
          expect(logDataArg.url).to.equal('http://example.com')
          expect(logDataArg.additionalOptions).to.equal({})
          expect(logDataArg.result.succeeded).to.be.false()
          expect(logDataArg.result.response).to.equal({
            statusCode: 500,
            body: '{"data":"hello world"}'
          })
        })

        describe('the result it returns', () => {
          it('has a "succeeded" property marked as false', async () => {
            const result = await BaseRequest.patch(testDomain)

            expect(result.succeeded).to.be.false()
          })

          it('has a "response" property containing the web response', async () => {
            const result = await BaseRequest.patch(testDomain)

            expect(result.response).to.exist()
            expect(result.response.statusCode).to.equal(500)
            expect(result.response.body).to.equal('{"data":"hello world"}')
          })
        })
      })

      describe('because there was a network issue', () => {
        describe('and all retries fail', () => {
          beforeEach(async () => {
            Nock(testDomain)
              .patch(() => {
                return true
              })
              .replyWithError({ code: 'ECONNRESET' })
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(2)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          it('logs and records the error', async () => {
            await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.args[0][1]

            expect(notifierStub.omfg.calledWith('PATCH request errored')).to.be.true()
            expect(logDataArg.method).to.equal('PATCH')
            expect(logDataArg.url).to.equal('http://example.com')
            expect(logDataArg.additionalOptions).to.exist()
            expect(logDataArg.result.succeeded).to.be.false()
            expect(logDataArg.result.response).to.be.an.error()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.false()
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response).to.be.an.error()
              expect(result.response.code).to.equal('ECONNRESET')
            })
          })
        })

        describe('and a retry succeeds', () => {
          beforeEach(async () => {
            // The first response will error, the second response will return OK
            Nock(testDomain)
              .patch(() => {
                return true
              })
              .replyWithError({ code: 'ECONNRESET' })
              .patch(() => {
                return true
              })
              .reply(200, { data: 'econnreset hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(1)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.true()
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response.statusCode).to.equal(200)
              expect(result.response.body).to.equal('{"data":"econnreset hello world"}')
            })
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
              .patch(() => {
                return true
              })
              .delay(100)
              .reply(200, { data: 'hello world' })
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(2)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          it('logs and records the error', async () => {
            await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.args[0][1]

            expect(notifierStub.omfg.calledWith('PATCH request errored')).to.be.true()
            expect(logDataArg.method).to.equal('PATCH')
            expect(logDataArg.url).to.equal('http://example.com')
            expect(logDataArg.additionalOptions).to.exist()
            expect(logDataArg.result.succeeded).to.be.false()
            expect(logDataArg.result.response).to.be.an.error()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.false()
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

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
              .patch(() => {
                return true
              })
              .delay(100)
              .reply(200, { data: 'hello world' })
              .patch(() => {
                return true
              })
              .reply(200, { data: 'delayed hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(1)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.true()
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.patch(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response.statusCode).to.equal(200)
              expect(result.response.body).to.equal('{"data":"delayed hello world"}')
            })
          })
        })
      })
    })

    describe('When I provide additional options', () => {
      describe('and they expand the default options', () => {
        beforeEach(() => {
          Nock(testDomain).patch('/').reply(200, { data: 'hello world' })
        })

        it('adds them to the options used when making the request', async () => {
          // We tell Got to return the response as json rather than text. We can confirm the option has been applied by
          // checking the result.response.body below.
          const options = { responseType: 'json' }
          const result = await BaseRequest.patch(testDomain, options)

          expect(result.succeeded).to.be.true()
          expect(result.response.body).to.equal({ data: 'hello world' })
        })
      })

      describe('and they replace a default option', () => {
        beforeEach(() => {
          Nock(testDomain).patch('/').reply(500)
        })

        it('uses them in the options used when making the request', async () => {
          // We tell Got throw an error if the response is not 2xx or 3xx
          const options = { throwHttpErrors: true }
          const result = await BaseRequest.patch(testDomain, options)

          expect(result.succeeded).to.be.false()
          expect(result.response).to.be.an.error()
        })
      })
    })
  })

  describe('#post()', () => {
    describe('When a request succeeds', () => {
      beforeEach(() => {
        Nock(testDomain).post('/').reply(200, { data: 'hello world' })
      })

      describe('the result it returns', () => {
        it('has a "succeeded" property marked as true', async () => {
          const result = await BaseRequest.post(testDomain)

          expect(result.succeeded).to.be.true()
        })

        it('has a "response" property containing the web response', async () => {
          const result = await BaseRequest.post(testDomain)

          expect(result.response).to.exist()
          expect(result.response.statusCode).to.equal(200)
          expect(result.response.body).to.equal('{"data":"hello world"}')
        })
      })
    })

    describe('When a request fails', () => {
      describe('because the response was a 500', () => {
        beforeEach(() => {
          Nock(testDomain).post('/').reply(500, { data: 'hello world' })
        })

        it('logs the failure', async () => {
          await BaseRequest.post(testDomain)

          const logDataArg = notifierStub.omg.args[0][1]

          expect(notifierStub.omg.calledWith('POST request failed')).to.be.true()
          expect(logDataArg.method).to.equal('POST')
          expect(logDataArg.url).to.equal('http://example.com')
          expect(logDataArg.additionalOptions).to.equal({})
          expect(logDataArg.result.succeeded).to.be.false()
          expect(logDataArg.result.response).to.equal({
            statusCode: 500,
            body: '{"data":"hello world"}'
          })
        })

        describe('the result it returns', () => {
          it('has a "succeeded" property marked as false', async () => {
            const result = await BaseRequest.post(testDomain)

            expect(result.succeeded).to.be.false()
          })

          it('has a "response" property containing the web response', async () => {
            const result = await BaseRequest.post(testDomain)

            expect(result.response).to.exist()
            expect(result.response.statusCode).to.equal(500)
            expect(result.response.body).to.equal('{"data":"hello world"}')
          })
        })
      })

      describe('because there was a network issue', () => {
        describe('and all retries fail', () => {
          beforeEach(async () => {
            Nock(testDomain)
              .post(() => {
                return true
              })
              .replyWithError({ code: 'ECONNRESET' })
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(2)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          it('logs and records the error', async () => {
            await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.args[0][1]

            expect(notifierStub.omfg.calledWith('POST request errored')).to.be.true()
            expect(logDataArg.method).to.equal('POST')
            expect(logDataArg.url).to.equal('http://example.com')
            expect(logDataArg.additionalOptions).to.exist()
            expect(logDataArg.result.succeeded).to.be.false()
            expect(logDataArg.result.response).to.be.an.error()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.false()
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response).to.be.an.error()
              expect(result.response.code).to.equal('ECONNRESET')
            })
          })
        })

        describe('and a retry succeeds', () => {
          beforeEach(async () => {
            // The first response will error, the second response will return OK
            Nock(testDomain)
              .post(() => {
                return true
              })
              .replyWithError({ code: 'ECONNRESET' })
              .post(() => {
                return true
              })
              .reply(200, { data: 'econnreset hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(1)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.true()
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response.statusCode).to.equal(200)
              expect(result.response.body).to.equal('{"data":"econnreset hello world"}')
            })
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
              .post(() => {
                return true
              })
              .delay(100)
              .reply(200, { data: 'hello world' })
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(2)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          it('logs and records the error', async () => {
            await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.args[0][1]

            expect(notifierStub.omfg.calledWith('POST request errored')).to.be.true()
            expect(logDataArg.method).to.equal('POST')
            expect(logDataArg.url).to.equal('http://example.com')
            expect(logDataArg.additionalOptions).to.exist()
            expect(logDataArg.result.succeeded).to.be.false()
            expect(logDataArg.result.response).to.be.an.error()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.false()
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

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
              .post(() => {
                return true
              })
              .delay(100)
              .reply(200, { data: 'hello world' })
              .post(() => {
                return true
              })
              .reply(200, { data: 'delayed hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg.callCount).to.equal(1)
            expect(notifierStub.omg.alwaysCalledWith('Retrying HTTP request')).to.be.true()
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).to.be.true()
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.post(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).to.exist()
              expect(result.response.statusCode).to.equal(200)
              expect(result.response.body).to.equal('{"data":"delayed hello world"}')
            })
          })
        })
      })
    })

    describe('When I provide additional options', () => {
      describe('and they expand the default options', () => {
        beforeEach(() => {
          Nock(testDomain).post('/').reply(200, { data: 'hello world' })
        })

        it('adds them to the options used when making the request', async () => {
          // We tell Got to return the response as json rather than text. We can confirm the option has been applied by
          // checking the result.response.body below.
          const options = { responseType: 'json' }
          const result = await BaseRequest.post(testDomain, options)

          expect(result.succeeded).to.be.true()
          expect(result.response.body).to.equal({ data: 'hello world' })
        })
      })

      describe('and they replace a default option', () => {
        beforeEach(() => {
          Nock(testDomain).post('/').reply(500)
        })

        it('uses them in the options used when making the request', async () => {
          // We tell Got throw an error if the response is not 2xx or 3xx
          const options = { throwHttpErrors: true }
          const result = await BaseRequest.post(testDomain, options)

          expect(result.succeeded).to.be.false()
          expect(result.response).to.be.an.error()
        })
      })
    })
  })
})
