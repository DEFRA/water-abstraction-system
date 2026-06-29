'use strict'

const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

// Test framework dependencies
const Sinon = require('sinon')

// For running our service
const { createServer } = require('../support/server.js')

describe('Check controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await createServer()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error and info to try and keep the test output as clean as possible
    Sinon.stub(server.logger, 'error')
    Sinon.stub(server.logger, 'info')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/check/placeholder', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', payload: { id: '506c20c7-7741-4c95-85c1-de3fe87314f3' }, url: '/check/placeholder' }
      })

      describe('when the request succeeds', () => {
        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
        })
      })
    })
  })
})
