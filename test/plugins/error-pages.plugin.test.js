'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const Boom = require('@hapi/boom')

// For running our service
const { init } = require('../../app/server.js')

describe('Error Pages plugin', () => {
  const request = {
    method: 'GET',
    url: '/error-pages'
  }

  let notifierStub
  let server
  let testRoute

  beforeEach(async () => {
    testRoute = {
      method: 'GET',
      path: '/error-pages',
      options: {
        auth: false
      }
    }

    // Create server before each test
    server = await init()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When the response is a Boom error', () => {
    describe('because the request was not found', () => {
      beforeEach(() => {
        testRoute.handler = (_request, _h) => {
          return Boom.notFound('where has my boom gone?')
        }
      })

      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          server.route(testRoute)
        })

        it('returns our 404 error HTML page', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).to.equal(404)
          expect(response.statusMessage).to.equal('Not Found')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('Page not found')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          testRoute.options.app = { plainOutput: true }

          server.route(testRoute)
        })

        it('returns a plain response', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).to.equal(404)
          expect(response.statusMessage).to.equal('Not Found')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains('where has my boom gone?')
        })
      })
    })

    describe('because the request was forbidden', () => {
      beforeEach(() => {
        testRoute.handler = (_request, _h) => {
          return Boom.forbidden("can't touch this")
        }
      })

      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          server.route(testRoute)
        })

        it('returns our 404 error HTML page', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).to.equal(404)
          expect(response.statusMessage).to.equal('Not Found')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('Page not found')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          testRoute.options.app = { plainOutput: true }

          server.route(testRoute)
        })

        it('returns a plain response', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).to.equal(403)
          expect(response.statusMessage).to.equal('Forbidden')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains("can't touch this")
        })
      })
    })

    describe('because the request was bad (any other error)', () => {
      beforeEach(() => {
        testRoute.handler = (_request, _h) => {
          return Boom.badRequest('computer says no')
        }
      })

      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          server.route(testRoute)
        })

        it('returns our 500 (there is a problem) error HTML page', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).to.equal(200)
          expect(response.statusMessage).to.equal('OK')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('Sorry, there is a problem with the service')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          testRoute.options.app = { plainOutput: true }

          server.route(testRoute)
        })

        it('returns a plain response', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).to.equal(400)
          expect(response.statusMessage).to.equal('Bad Request')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains('computer says no')
        })
      })
    })
  })

  describe('When the response is not a Boom error', () => {
    beforeEach(() => {
      testRoute.handler = (_request, h) => {
        return h.response({ hello: 'world' }).code(200)
      }
    })

    describe('and the route is not configured for plain output (redirect to error page)', () => {
      beforeEach(async () => {
        server.route(testRoute)
      })

      it('lets the response continue without change', async () => {
        const response = await server.inject(request)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).equal('{"hello":"world"}')
      })
    })

    describe('and the route is configured for plain output (do not redirect to error page)', () => {
      beforeEach(async () => {
        testRoute.options.app = { plainOutput: true }
        server.route(testRoute)
      })

      it('lets the response continue without change', async () => {
        const response = await server.inject(request)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).equal('{"hello":"world"}')
      })
    })
  })
})
