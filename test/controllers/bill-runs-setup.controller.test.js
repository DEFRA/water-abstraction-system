'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const InitiateSessionService = require('../../app/services/bill-runs/setup/initiate-session.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs Setup controller', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('GET /bill-runs/setup', () => {
    const session = { id: 'e009b394-8405-4358-86af-1a9eb31298a5', data: {} }

    let options

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/bill-runs/setup',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
    })

    describe('when a request is valid', () => {
      beforeEach(async () => {
        Sinon.stub(InitiateSessionService, 'go').resolves(session)
      })

      it('redirects to select bill run type page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal(`/system/bill-runs/setup/${session.id}/type`)
      })
    })
  })
})
