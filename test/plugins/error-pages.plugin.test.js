'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
  HTTP_STATUS_GONE,
  HTTP_STATUS_INTERNAL_SERVER_ERROR
} = require('node:http2').constants
const Boom = require('@hapi/boom')
const SessionNotFoundError = require('../../app/errors/session-not-found.error.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Error Pages plugin', () => {
  let handler

  let path
  let server

  before(async () => {
    // Create server before running the tests
    server = await init()

    global.GlobalNotifier.resetNotifier()
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(() => {})

  describe('When the response is a Boom error', () => {
    describe('because the request was not found', () => {
      before(() => {
        handler = (_request, _h) => {
          return Boom.notFound('where has my boom gone?')
        }
      })

      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          path = '/error-pages/not-found/not-plain'
          server.route({ method: 'GET', options: { auth: false }, path, handler })
        })

        it('returns our 404 error HTML page', async () => {
          const response = await server.inject({ method: 'GET', url: path })

          expect(response.statusCode).to.equal(HTTP_STATUS_NOT_FOUND)
          expect(response.statusMessage).to.equal('Not Found')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('Page not found')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          path = '/error-pages/not-found/plain'
          server.route({ method: 'GET', options: { app: { plainOutput: true }, auth: false }, path, handler })
        })

        it('returns a plain response', async () => {
          const response = await server.inject({ method: 'GET', url: path })

          expect(response.statusCode).to.equal(HTTP_STATUS_NOT_FOUND)
          expect(response.statusMessage).to.equal('Not Found')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains('where has my boom gone?')
        })
      })
    })

    describe('because the request was forbidden', () => {
      before(() => {
        handler = (_request, _h) => {
          return Boom.forbidden("can't touch this")
        }
      })

      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          path = '/error-pages/forbidden/not-plain'
          server.route({ method: 'GET', options: { auth: false }, path, handler })
        })

        it('returns our 404 error HTML page', async () => {
          const response = await server.inject({ method: 'GET', url: path })

          expect(response.statusCode).to.equal(HTTP_STATUS_NOT_FOUND)
          expect(response.statusMessage).to.equal('Not Found')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('Page not found')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          path = '/error-pages/forbidden/plain'
          server.route({ method: 'GET', options: { app: { plainOutput: true }, auth: false }, path, handler })
        })

        it('returns a plain response', async () => {
          const response = await server.inject({ method: 'GET', url: path })

          expect(response.statusCode).to.equal(HTTP_STATUS_FORBIDDEN)
          expect(response.statusMessage).to.equal('Forbidden')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains("can't touch this")
        })
      })
    })

    describe('because the request was a session not found', () => {
      before(() => {
        handler = (_request, _h) => {
          throw new SessionNotFoundError('Session has expired')
        }
      })

      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          path = '/error-pages/session/not-plain'
          server.route({ method: 'GET', options: { auth: false }, path, handler })
        })

        it('returns our 410 error HTML page', async () => {
          const response = await server.inject({ method: 'GET', url: path })

          expect(response.statusCode).to.equal(HTTP_STATUS_GONE)
          expect(response.statusMessage).to.equal('Gone')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('The session no longer exists')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          path = '/error-pages/session/plain'
          server.route({ method: 'GET', options: { app: { plainOutput: true }, auth: false }, path, handler })
        })

        it('returns a plain response', async () => {
          const response = await server.inject({ method: 'GET', url: path })

          expect(response.statusCode).to.equal(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          expect(response.statusMessage).to.equal('Internal Server Error')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains('An internal server error occurred')
        })
      })
    })

    describe('because the request was bad (any other error)', () => {
      before(() => {
        handler = (_request, _h) => {
          return Boom.badRequest('computer says no')
        }
      })

      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          path = '/error-pages/bad/not-plain'
          server.route({ method: 'GET', options: { auth: false }, path, handler })
        })

        it('returns our 500 (there is a problem) error HTML page', async () => {
          const response = await server.inject({ method: 'GET', url: path })

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.statusMessage).to.equal('OK')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('Sorry, there is a problem with the service')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          path = '/error-pages/bad/plain'
          server.route({ method: 'GET', options: { app: { plainOutput: true }, auth: false }, path, handler })
        })

        it('returns a plain response', async () => {
          const response = await server.inject({ method: 'GET', url: path })

          expect(response.statusCode).to.equal(HTTP_STATUS_BAD_REQUEST)
          expect(response.statusMessage).to.equal('Bad Request')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains('computer says no')
        })
      })
    })
  })

  describe('When the response is not a Boom error', () => {
    before(() => {
      handler = (_request, h) => {
        return h.response({ hello: 'world' }).code(200)
      }
    })

    describe('and the route is not configured for plain output (do not redirect to error page)', () => {
      beforeEach(async () => {
        path = '/error-pages/good/not-plain'
        server.route({ method: 'GET', options: { auth: false }, path, handler })
      })

      it('lets the response continue without change', async () => {
        const response = await server.inject({ method: 'GET', url: path })

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).equal('{"hello":"world"}')
      })
    })

    describe('and the route is configured for plain output (do not redirect to error page)', () => {
      beforeEach(async () => {
        path = '/error-pages/good/plain'
        server.route({ method: 'GET', options: { app: { plainOutput: true }, auth: false }, path, handler })
      })

      it('lets the response continue without change', async () => {
        const response = await server.inject({ method: 'GET', url: path })

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).equal('{"hello":"world"}')
      })
    })
  })
})
