'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const InitiateReturnRequirementSessionService = require('../../app/services/return-requirements/initiate-return-requirement-session.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Licences controller', () => {
  let options
  let server

  beforeEach(async () => {
    // Create server before each test
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

  describe('GET /licences/{id}/no-returns-required', () => {
    const sessionId = '1c265420-6a5e-4a4c-94e4-196d7799ed01'

    describe('when a request is valid', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/no-returns-required',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }

        Sinon.stub(InitiateReturnRequirementSessionService, 'go').resolves(sessionId)
      })

      it('redirects to select return start date page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal(`/system/return-requirements/${sessionId}/select-return-start-date`)
      })
    })
  })
})
