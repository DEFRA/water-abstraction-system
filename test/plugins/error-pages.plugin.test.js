'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const Boom = require('@hapi/boom')

// For running our service
const { init } = require('../../app/server.js')
const { Exception } = require('sass')

describe('Error Pages plugin', () => {
  const options = {
    method: 'GET',
    url: '/error-pages'
  }
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
  })

  describe('When the error is a Boom error', () => {
    describe('and it is not a 404', () => {
      describe('and it is a route without errorPages options', () => {
        beforeEach(async () => {
          server.route({
            method: 'GET',
            path: '/error-pages',
            handler: function (_request, _h) {
              return Boom.badRequest('Things go boom')
            }
          })
        })

        it('returns our general error HTML page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(400)
          expect(response.statusMessage).to.equal('Bad Request')
          expect(response.payload).startsWith('<!DOCTYPE html>')
          expect(response.payload).contains('Sorry, there is a problem with the service')
        })
      })

      describe('and it is a route with errorPages options', () => {
        beforeEach(async () => {
          server.route({
            method: 'GET',
            path: '/error-pages',
            options: {
              plugins: {
                errorPages: {
                  plainOutput: true
                }
              }
            },
            handler: function (_request, _h) {
              return Boom.badRequest('Things go boom')
            }
          })
        })

        it('returns a plain response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(400)
          expect(response.statusMessage).to.equal('Bad Request')
          expect(response.payload).not.to.startWith('<!DOCTYPE html>')
          expect(response.payload).contains('Things go boom')
        })
      })
    })

    describe('and it is a 404', () => {
      it('returns our 404 error HTML page', async () => {
        const response = await server.inject({ method: 'GET', url: '/no-one-here' })

        expect(response.statusCode).to.equal(404)
        expect(response.statusMessage).to.equal('Not Found')
        expect(response.payload).startsWith('<!DOCTYPE html>')
        expect(response.payload).contains('Page not found')
      })
    })
  })

  describe('When the error is not a Boom error', () => {
    describe('and it is a route without errorPages options', () => {
      beforeEach(async () => {
        server.route({
          method: 'GET',
          path: '/error-pages',
          handler: function (_request, _h) {
            throw new Exception('Things go boom')
          }
        })
      })

      it('returns our general error HTML page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(500)
        expect(response.statusMessage).to.equal('Internal Server Error')
        expect(response.payload).startsWith('<!DOCTYPE html>')
        expect(response.payload).contains('Sorry, there is a problem with the service')
      })
    })

    describe('and it is a route with errorPages options', () => {
      beforeEach(async () => {
        server.route({
          method: 'GET',
          path: '/error-pages',
          options: {
            plugins: {
              errorPages: {
                plainOutput: true
              }
            }
          },
          handler: function (_request, _h) {
            throw new Exception('Things go boom')
          }
        })
      })

      it('returns a plain response', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(500)
        expect(response.statusMessage).to.equal('Internal Server Error')
        expect(response.payload).not.to.startWith('<!DOCTYPE html>')
        expect(response.payload).contains('An internal server error occurred')
      })
    })
  })
})
