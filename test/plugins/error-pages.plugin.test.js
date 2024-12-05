'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const Boom = require('@hapi/boom')

// For running our service
const { init } = require('../../app/server.js')

describe('Error Pages plugin', () => {
  let handler
  let notifierStub
  let path
  let server

  before(async () => {
    // Create server before running the tests
    server = await init()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

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

          expect(response.statusCode).to.equal(404)
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

          expect(response.statusCode).to.equal(404)
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

          expect(response.statusCode).to.equal(404)
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

          expect(response.statusCode).to.equal(403)
          expect(response.statusMessage).to.equal('Forbidden')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains("can't touch this")
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

          expect(response.statusCode).to.equal(200)
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

          expect(response.statusCode).to.equal(400)
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

        expect(response.statusCode).to.equal(200)
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

        expect(response.statusCode).to.equal(200)
        expect(response.payload).equal('{"hello":"world"}')
      })
    })
  })
})
