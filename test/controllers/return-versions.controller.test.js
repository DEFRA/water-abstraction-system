'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const ViewService = require('../../app/services/return-versions/view.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Versions controller', () => {
  let server

  // Create server before running the tests
  before(async () => {
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
              credentials: { scope: ['billing'] }
            }
          })

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Requirements for returns valid from')
        })
      })
    })
  })
})
