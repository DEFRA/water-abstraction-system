'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ErrorPagesService = require('../../app/services/plugins/error-pages.service.js')

// Test helpers
const Boom = require('@hapi/boom')

// For running our service
const { init } = require('../../app/server.js')

describe('Error Pages plugin', () => {
  const request = {
    method: 'GET',
    url: '/error-pages'
  }

  let testRoute
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When the response is a Boom error', () => {
    beforeEach(() => {
      testRoute = {
        method: 'GET',
        path: '/error-pages',
        handler: function (_request, _h) {
          return Boom.badRequest('Things go boom')
        }
      }
    })

    describe('and it is not a 404', () => {
      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          server.route(testRoute)

          Sinon.stub(ErrorPagesService, 'go').returns({ stopResponse: true, statusCode: 400 })
        })

        it('returns our general error HTML page', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).to.equal(400)
          expect(response.statusMessage).to.equal('Bad Request')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('Sorry, there is a problem with the service')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          testRoute.options = { app: { plainOutput: true } }
          server.route(testRoute)

          Sinon.stub(ErrorPagesService, 'go').returns({ stopResponse: false, statusCode: 400 })
        })

        it('returns a plain response', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).to.equal(400)
          expect(response.statusMessage).to.equal('Bad Request')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains('Things go boom')
        })
      })
    })

    describe('and it is a 404', () => {
      beforeEach(() => {
        Sinon.stub(ErrorPagesService, 'go').returns({ stopResponse: true, statusCode: 404 })
      })

      it('returns our 404 error HTML page', async () => {
        const response = await server.inject(request)

        expect(response.statusCode).to.equal(404)
        expect(response.statusMessage).to.equal('Not Found')
        expect(response.payload).startsWith('<!DOCTYPE html>')
        expect(response.payload).contains('Page not found')
      })
    })
  })

  describe('When the response is not a Boom error', () => {
    beforeEach(() => {
      testRoute = {
        method: 'GET',
        path: '/error-pages',
        handler: function (_request, h) {
          return h.response({ hello: 'world' }).code(200)
        }
      }
    })

    describe('and the route is not configured for plain output (redirect to error page)', () => {
      beforeEach(async () => {
        server.route(testRoute)

        Sinon.stub(ErrorPagesService, 'go').returns({ stopResponse: false, statusCode: 200 })
      })

      it('lets the response continue without change', async () => {
        const response = await server.inject(request)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).equal('{"hello":"world"}')
      })
    })

    describe('and the route is configured for plain output (do not redirect to error page)', () => {
      beforeEach(async () => {
        testRoute.options = { app: { plainOutput: true } }
        server.route(testRoute)

        Sinon.stub(ErrorPagesService, 'go').returns({ stopResponse: false, statusCode: 200 })
      })

      it('lets the response continue without change', async () => {
        const response = await server.inject(request)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).equal('{"hello":"world"}')
      })
    })
  })
})
