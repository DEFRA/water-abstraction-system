'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const { HTTP_STATUS_OK } = require('node:http2').constants

// Things we need to stub
const ViewService = require('../../app/services/return-versions/view.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Versions controller', () => {
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

  describe('/return-versions/{id}', () => {
    const id = '2a075724-b66c-410e-9fc8-b964077204f2'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(ViewService, 'go').resolves({
          pageTitle: 'Requirements for returns valid from'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject({
            method: 'GET',
            url: `/return-versions/${id}/`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['view_charge_versions'] }
            }
          })

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Requirements for returns valid from')
        })
      })
    })
  })
})
