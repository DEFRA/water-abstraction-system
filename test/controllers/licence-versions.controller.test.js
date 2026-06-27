'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const { HTTP_STATUS_OK } = require('node:http2').constants

// Things we need to stub
const ViewService = require('../../app/services/licence-versions/view.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Licence Versions controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('/licence-versions/{id}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licence-versions/123',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(ViewService, 'go').resolves({ pageTitle: 'Licence version starting' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Licence version starting')
        })
      })
    })
  })
})
