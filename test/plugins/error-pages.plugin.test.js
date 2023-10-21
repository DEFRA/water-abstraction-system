'use strict'

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

  describe('When the response is a Boom error', () => {
    beforeEach(() => {
      testRoute = {
        method: 'GET',
        path: '/error-pages',
        handler: function (_request, _h) {
          return Boom.badRequest('Things go boom')
        },
        options: {
          auth: false
        }
      }
    })

    describe('and it is not a 404', () => {
      describe('and the route is not configured for plain output (redirect to error page)', () => {
        beforeEach(async () => {
          server.route(testRoute)

          jest.spyOn(ErrorPagesService, 'go').mockReturnValue({ stopResponse: true, statusCode: 400 })
        })

        it('mockReturnValue our general error HTML page', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).toEqual(400)
          expect(response.statusMessage).toEqual('Bad Request')
          expect(response.payload).toMatch('<!DOCTYPE html>')
          expect(response.payload).toContain('Sorry, there is a problem with the service')
        })
      })

      describe('and the route is configured for plain output (do not redirect to error page)', () => {
        beforeEach(async () => {
          testRoute.options.app = { plainOutput: true }
          server.route(testRoute)

          jest.spyOn(ErrorPagesService, 'go').mockReturnValue({ stopResponse: false, statusCode: 400 })
        })

        it('mockReturnValue a plain response', async () => {
          const response = await server.inject(request)

          expect(response.statusCode).toEqual(400)
          expect(response.statusMessage).toEqual('Bad Request')
          expect(response.payload).not.toMatch('<!DOCTYPE html>')
          expect(response.payload).toContain('Things go boom')
        })
      })
    })

    describe('and it is a 404', () => {
      beforeEach(() => {
        jest.spyOn(ErrorPagesService, 'go').mockReturnValue({ stopResponse: true, statusCode: 404 })
      })

      it('mockReturnValue our 404 error HTML page', async () => {
        const response = await server.inject(request)

        expect(response.statusCode).toEqual(404)
        expect(response.statusMessage).toEqual('Not Found')
        expect(response.payload).toMatch('<!DOCTYPE html>')
        expect(response.payload).toContain('Page not found')
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
        },
        options: {
          auth: false
        }
      }
    })

    describe('and the route is not configured for plain output (redirect to error page)', () => {
      beforeEach(async () => {
        server.route(testRoute)

        jest.spyOn(ErrorPagesService, 'go').mockReturnValue({ stopResponse: false, statusCode: 200 })
      })

      it('lets the response continue without change', async () => {
        const response = await server.inject(request)

        expect(response.statusCode).toEqual(200)
        expect(response.payload).toEqual('{"hello":"world"}')
      })
    })

    describe('and the route is configured for plain output (do not redirect to error page)', () => {
      beforeEach(async () => {
        testRoute.options.app = { plainOutput: true }
        server.route(testRoute)

        jest.spyOn(ErrorPagesService, 'go').mockReturnValue({ stopResponse: false, statusCode: 200 })
      })

      it('lets the response continue without change', async () => {
        const response = await server.inject(request)

        expect(response.statusCode).toEqual(200)
        expect(response.payload).toEqual('{"hello":"world"}')
      })
    })
  })
})
