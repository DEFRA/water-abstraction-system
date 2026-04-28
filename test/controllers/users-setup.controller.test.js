'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = require('node:http2').constants
const { generateUUID } = require('../../app/lib/general.lib.js')

// Things we need to stub
const InitiateSessionService = require('../../app/services/users/internal/setup/initiate-session.service.js')
const UserEmailService = require('../../app/services/users/internal/setup/user-email.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Users Setup controller', () => {
  const sessionId = generateUUID()

  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(() => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/users/internal/setup', () => {
    describe('GET', () => {
      const id = generateUUID()

      beforeEach(() => {
        options = _getOptions('/users/internal/setup', { scope: ['manage_accounts'] })

        Sinon.stub(InitiateSessionService, 'go').resolves({ data: {}, id })
      })

      it('initiates a session and redirects to the "Enter an email address for the user" page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/users/internal/setup/${id}/user-email`)
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/user-email', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/user-email`, { scope: ['manage_accounts'] })

        Sinon.stub(UserEmailService, 'go').resolves({
          pageTitle: 'Enter an email address for the user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Enter an email address for the user')
        })
      })
    })
  })
})

function _getOptions(url, credentials) {
  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials
    }
  }
}
