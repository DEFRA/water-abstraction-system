// Test framework dependencies

import Nock from 'nock'

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } = http2.constants
import serverConfig from '../../config/server.config.js'

// Things we need to stub
import GlobalNotifierStub from '../support/stubs/global-notifier.stub.js'

// Thing under test
import * as BaseRequest from '../../app/requests/base.request.js'

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
    if (!Nock.isActive()) {
      Nock.activate()
    }

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Nock.cleanAll()
    Nock.restore()
    delete globalThis.GlobalNotifier
  })

  describe('#delete()', () => {
    describe('When a request succeeds', () => {
      beforeEach(() => {
        Nock(testDomain).delete('/').reply(200, { data: 'hello world' })
      })

      describe('the result it returns', () => {
        it('has a "succeeded" property marked as true', async () => {
          const result = await BaseRequest.deleteRequest(testDomain)

          expect(result.succeeded).toBe(true)
        })

        it('has a "response" property containing the web response', async () => {
          const result = await BaseRequest.deleteRequest(testDomain)

          expect(result.response).toBeDefined()
          expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(result.response.body).toEqual('{"data":"hello world"}')
        })
      })
    })

    describe('When a request fails', () => {
      describe('because the response was a 500', () => {
        beforeEach(() => {
          Nock(testDomain).delete('/').reply(500, { data: 'hello world' })
        })

        it('logs the failure', async () => {
          await BaseRequest.deleteRequest(testDomain)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('DELETE request failed')
          expect(logDataArg.method).toEqual('DELETE')
          expect(logDataArg.url).toEqual('http://example.com')
          expect(logDataArg.additionalOptions).toEqual({})
          expect(logDataArg.result.succeeded).toBe(false)
          expect(logDataArg.result.response).toEqual({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
            body: '{"data":"hello world"}'
          })
        })

        describe('the result it returns', () => {
          it('has a "succeeded" property marked as false', async () => {
            const result = await BaseRequest.deleteRequest(testDomain)

            expect(result.succeeded).toBe(false)
          })

          it('has a "response" property containing the web response', async () => {
            const result = await BaseRequest.deleteRequest(testDomain)

            expect(result.response).toBeDefined()
            expect(result.response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
            expect(result.response.body).toEqual('{"data":"hello world"}')
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
              .replyWithError(_connectionResetError())
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(2)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          it('logs and records the error', async () => {
            await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.mock.calls[0][1]

            expect(notifierStub.omfg).toHaveBeenCalledWith('DELETE request errored')
            expect(logDataArg.method).toEqual('DELETE')
            expect(logDataArg.url).toEqual('http://example.com')
            expect(logDataArg.additionalOptions).toBeDefined()
            expect(logDataArg.result.succeeded).toBe(false)
            expect(logDataArg.result.response).toBeInstanceOf(Error)
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(false)
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response).toBeInstanceOf(Error)
              expect(result.response.code).toEqual('ECONNRESET')
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
              .replyWithError(_connectionResetError())
              .delete(() => {
                return true
              })
              .reply(200, { data: 'econnreset hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(1)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(true)
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
              expect(result.response.body).toEqual('{"data":"econnreset hello world"}')
            })
          })
        })
      })

      describe('because request timed out', () => {
        beforeEach(async () => {
          // Set the timeout value to 50ms for these tests
          vi.replaceProperty(serverConfig, 'requestTimeout', 50)
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
            await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(2)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          it('logs and records the error', async () => {
            await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.mock.calls[0][1]

            expect(notifierStub.omfg).toHaveBeenCalledWith('DELETE request errored')
            expect(logDataArg.method).toEqual('DELETE')
            expect(logDataArg.url).toEqual('http://example.com')
            expect(logDataArg.additionalOptions).toBeDefined()
            expect(logDataArg.result.succeeded).toBe(false)
            expect(logDataArg.result.response).toBeInstanceOf(Error)
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(false)
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response).toBeInstanceOf(Error)
              expect(result.response.code).toEqual('ETIMEDOUT')
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
            await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(1)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(true)
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.deleteRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
              expect(result.response.body).toEqual('{"data":"delayed hello world"}')
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
          const result = await BaseRequest.deleteRequest(testDomain, options)

          expect(result.succeeded).toBe(true)
          expect(result.response.body).toEqual({ data: 'hello world' })
        })
      })

      describe('and they replace a default option', () => {
        beforeEach(() => {
          Nock(testDomain).delete('/').reply(500)
        })

        it('uses them in the options used when making the request', async () => {
          // We tell Got throw an error if the response is not 2xx or 3xx
          const options = { throwHttpErrors: true }
          const result = await BaseRequest.deleteRequest(testDomain, options)

          expect(result.succeeded).toBe(false)
          expect(result.response).toBeInstanceOf(Error)
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
          const result = await BaseRequest.getRequest(testDomain)

          expect(result.succeeded).toBe(true)
        })

        it('has a "response" property containing the web response', async () => {
          const result = await BaseRequest.getRequest(testDomain)

          expect(result.response).toBeDefined()
          expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(result.response.body).toEqual('{"data":"hello world"}')
        })
      })
    })

    describe('When a request fails', () => {
      describe('because the response was a 500', () => {
        beforeEach(() => {
          Nock(testDomain).get('/').reply(500, { data: 'hello world' })
        })

        it('logs the failure', async () => {
          await BaseRequest.getRequest(testDomain)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('GET request failed')
          expect(logDataArg.method).toEqual('GET')
          expect(logDataArg.url).toEqual('http://example.com')
          expect(logDataArg.additionalOptions).toEqual({})
          expect(logDataArg.result.succeeded).toBe(false)
          expect(logDataArg.result.response).toEqual({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
            body: '{"data":"hello world"}'
          })
        })

        describe('the result it returns', () => {
          it('has a "succeeded" property marked as false', async () => {
            const result = await BaseRequest.getRequest(testDomain)

            expect(result.succeeded).toBe(false)
          })

          it('has a "response" property containing the web response', async () => {
            const result = await BaseRequest.getRequest(testDomain)

            expect(result.response).toBeDefined()
            expect(result.response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
            expect(result.response.body).toEqual('{"data":"hello world"}')
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
              .replyWithError(_connectionResetError())
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(2)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          it('logs and records the error', async () => {
            await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.mock.calls[0][1]

            expect(notifierStub.omfg).toHaveBeenCalledWith('GET request errored')
            expect(logDataArg.method).toEqual('GET')
            expect(logDataArg.url).toEqual('http://example.com')
            expect(logDataArg.additionalOptions).toBeDefined()
            expect(logDataArg.result.succeeded).toBe(false)
            expect(logDataArg.result.response).toBeInstanceOf(Error)
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(false)
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response).toBeInstanceOf(Error)
              expect(result.response.code).toEqual('ECONNRESET')
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
              .replyWithError(_connectionResetError())
              .get(() => {
                return true
              })
              .reply(200, { data: 'econnreset hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(1)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(true)
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
              expect(result.response.body).toEqual('{"data":"econnreset hello world"}')
            })
          })
        })
      })

      describe('because request timed out', () => {
        beforeEach(async () => {
          // Set the timeout value to 50ms for these tests
          vi.replaceProperty(serverConfig, 'requestTimeout', 50)
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
            await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(2)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          it('logs and records the error', async () => {
            await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.mock.calls[0][1]

            expect(notifierStub.omfg).toHaveBeenCalledWith('GET request errored')
            expect(logDataArg.method).toEqual('GET')
            expect(logDataArg.url).toEqual('http://example.com')
            expect(logDataArg.additionalOptions).toBeDefined()
            expect(logDataArg.result.succeeded).toBe(false)
            expect(logDataArg.result.response).toBeInstanceOf(Error)
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(false)
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response).toBeInstanceOf(Error)
              expect(result.response.code).toEqual('ETIMEDOUT')
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
            await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(1)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(true)
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.getRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
              expect(result.response.body).toEqual('{"data":"delayed hello world"}')
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
          const result = await BaseRequest.getRequest(testDomain, options)

          expect(result.succeeded).toBe(true)
          expect(result.response.body).toEqual({ data: 'hello world' })
        })
      })

      describe('and they replace a default option', () => {
        beforeEach(() => {
          Nock(testDomain).get('/').reply(500)
        })

        it('uses them in the options used when making the request', async () => {
          // We tell Got throw an error if the response is not 2xx or 3xx
          const options = { throwHttpErrors: true }
          const result = await BaseRequest.getRequest(testDomain, options)

          expect(result.succeeded).toBe(false)
          expect(result.response).toBeInstanceOf(Error)
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
          const result = await BaseRequest.patchRequest(testDomain)

          expect(result.succeeded).toBe(true)
        })

        it('has a "response" property containing the web response', async () => {
          const result = await BaseRequest.patchRequest(testDomain)

          expect(result.response).toBeDefined()
          expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(result.response.body).toEqual('{"data":"hello world"}')
        })
      })
    })

    describe('When a request fails', () => {
      describe('because the response was a 500', () => {
        beforeEach(() => {
          Nock(testDomain).patch('/').reply(500, { data: 'hello world' })
        })

        it('logs the failure', async () => {
          await BaseRequest.patchRequest(testDomain)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('PATCH request failed')
          expect(logDataArg.method).toEqual('PATCH')
          expect(logDataArg.url).toEqual('http://example.com')
          expect(logDataArg.additionalOptions).toEqual({})
          expect(logDataArg.result.succeeded).toBe(false)
          expect(logDataArg.result.response).toEqual({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
            body: '{"data":"hello world"}'
          })
        })

        describe('the result it returns', () => {
          it('has a "succeeded" property marked as false', async () => {
            const result = await BaseRequest.patchRequest(testDomain)

            expect(result.succeeded).toBe(false)
          })

          it('has a "response" property containing the web response', async () => {
            const result = await BaseRequest.patchRequest(testDomain)

            expect(result.response).toBeDefined()
            expect(result.response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
            expect(result.response.body).toEqual('{"data":"hello world"}')
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
              .replyWithError(_connectionResetError())
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(2)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          it('logs and records the error', async () => {
            await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.mock.calls[0][1]

            expect(notifierStub.omfg).toHaveBeenCalledWith('PATCH request errored')
            expect(logDataArg.method).toEqual('PATCH')
            expect(logDataArg.url).toEqual('http://example.com')
            expect(logDataArg.additionalOptions).toBeDefined()
            expect(logDataArg.result.succeeded).toBe(false)
            expect(logDataArg.result.response).toBeInstanceOf(Error)
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(false)
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response).toBeInstanceOf(Error)
              expect(result.response.code).toEqual('ECONNRESET')
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
              .replyWithError(_connectionResetError())
              .patch(() => {
                return true
              })
              .reply(200, { data: 'econnreset hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(1)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(true)
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
              expect(result.response.body).toEqual('{"data":"econnreset hello world"}')
            })
          })
        })
      })

      describe('because request timed out', () => {
        beforeEach(async () => {
          // Set the timeout value to 50ms for these tests
          vi.replaceProperty(serverConfig, 'requestTimeout', 50)
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
            await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(2)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          it('logs and records the error', async () => {
            await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.mock.calls[0][1]

            expect(notifierStub.omfg).toHaveBeenCalledWith('PATCH request errored')
            expect(logDataArg.method).toEqual('PATCH')
            expect(logDataArg.url).toEqual('http://example.com')
            expect(logDataArg.additionalOptions).toBeDefined()
            expect(logDataArg.result.succeeded).toBe(false)
            expect(logDataArg.result.response).toBeInstanceOf(Error)
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(false)
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response).toBeInstanceOf(Error)
              expect(result.response.code).toEqual('ETIMEDOUT')
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
            await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(1)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(true)
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.patchRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
              expect(result.response.body).toEqual('{"data":"delayed hello world"}')
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
          const result = await BaseRequest.patchRequest(testDomain, options)

          expect(result.succeeded).toBe(true)
          expect(result.response.body).toEqual({ data: 'hello world' })
        })
      })

      describe('and they replace a default option', () => {
        beforeEach(() => {
          Nock(testDomain).patch('/').reply(500)
        })

        it('uses them in the options used when making the request', async () => {
          // We tell Got throw an error if the response is not 2xx or 3xx
          const options = { throwHttpErrors: true }
          const result = await BaseRequest.patchRequest(testDomain, options)

          expect(result.succeeded).toBe(false)
          expect(result.response).toBeInstanceOf(Error)
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
          const result = await BaseRequest.postRequest(testDomain)

          expect(result.succeeded).toBe(true)
        })

        it('has a "response" property containing the web response', async () => {
          const result = await BaseRequest.postRequest(testDomain)

          expect(result.response).toBeDefined()
          expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(result.response.body).toEqual('{"data":"hello world"}')
        })
      })
    })

    describe('When a request fails', () => {
      describe('because the response was a 500', () => {
        beforeEach(() => {
          Nock(testDomain).post('/').reply(500, { data: 'hello world' })
        })

        it('logs the failure', async () => {
          await BaseRequest.postRequest(testDomain)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('POST request failed')
          expect(logDataArg.method).toEqual('POST')
          expect(logDataArg.url).toEqual('http://example.com')
          expect(logDataArg.additionalOptions).toEqual({})
          expect(logDataArg.result.succeeded).toBe(false)
          expect(logDataArg.result.response).toEqual({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
            body: '{"data":"hello world"}'
          })
        })

        describe('the result it returns', () => {
          it('has a "succeeded" property marked as false', async () => {
            const result = await BaseRequest.postRequest(testDomain)

            expect(result.succeeded).toBe(false)
          })

          it('has a "response" property containing the web response', async () => {
            const result = await BaseRequest.postRequest(testDomain)

            expect(result.response).toBeDefined()
            expect(result.response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
            expect(result.response.body).toEqual('{"data":"hello world"}')
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
              .replyWithError(_connectionResetError())
              .persist()
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(2)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          it('logs and records the error', async () => {
            await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.mock.calls[0][1]

            expect(notifierStub.omfg).toHaveBeenCalledWith('POST request errored')
            expect(logDataArg.method).toEqual('POST')
            expect(logDataArg.url).toEqual('http://example.com')
            expect(logDataArg.additionalOptions).toBeDefined()
            expect(logDataArg.result.succeeded).toBe(false)
            expect(logDataArg.result.response).toBeInstanceOf(Error)
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(false)
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response).toBeInstanceOf(Error)
              expect(result.response.code).toEqual('ECONNRESET')
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
              .replyWithError(_connectionResetError())
              .post(() => {
                return true
              })
              .reply(200, { data: 'econnreset hello world' })
          })

          it('logs when a retry has happened', async () => {
            await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(1)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(true)
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
              expect(result.response.body).toEqual('{"data":"econnreset hello world"}')
            })
          })
        })
      })

      describe('because request timed out', () => {
        beforeEach(async () => {
          // Set the timeout value to 50ms for these tests
          vi.replaceProperty(serverConfig, 'requestTimeout', 50)
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
            await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(2)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          it('logs and records the error', async () => {
            await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            const logDataArg = notifierStub.omfg.mock.calls[0][1]

            expect(notifierStub.omfg).toHaveBeenCalledWith('POST request errored')
            expect(logDataArg.method).toEqual('POST')
            expect(logDataArg.url).toEqual('http://example.com')
            expect(logDataArg.additionalOptions).toBeDefined()
            expect(logDataArg.result.succeeded).toBe(false)
            expect(logDataArg.result.response).toBeInstanceOf(Error)
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as false', async () => {
              const result = await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(false)
            })

            it('has a "response" property containing the error', async () => {
              const result = await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response).toBeInstanceOf(Error)
              expect(result.response.code).toEqual('ETIMEDOUT')
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
            await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

            expect(notifierStub.omg).toHaveBeenCalledTimes(1)
            expect(notifierStub.omg).toHaveBeenCalledWith('Retrying HTTP request')
          })

          describe('the result it returns', () => {
            it('has a "succeeded" property marked as true', async () => {
              const result = await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.succeeded).toBe(true)
            })

            it('has a "response" property containing the web response', async () => {
              const result = await BaseRequest.postRequest(testDomain, { retry: shortBackoffLimitRetryOptions })

              expect(result.response).toBeDefined()
              expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
              expect(result.response.body).toEqual('{"data":"delayed hello world"}')
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
          const result = await BaseRequest.postRequest(testDomain, options)

          expect(result.succeeded).toBe(true)
          expect(result.response.body).toEqual({ data: 'hello world' })
        })
      })

      describe('and they replace a default option', () => {
        beforeEach(() => {
          Nock(testDomain).post('/').reply(500)
        })

        it('uses them in the options used when making the request', async () => {
          // We tell Got throw an error if the response is not 2xx or 3xx
          const options = { throwHttpErrors: true }
          const result = await BaseRequest.postRequest(testDomain, options)

          expect(result.succeeded).toBe(false)
          expect(result.response).toBeInstanceOf(Error)
        })
      })
    })
  })
})

function _connectionResetError() {
  return Object.assign(new Error('Connection reset by peer'), { code: 'ECONNRESET' })
}
