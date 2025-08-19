'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const SubmitProfileDetailsService = require('../../app/services/users/submit-profile-details.service.js')
const ViewProfileDetailsService = require('../../app/services/users/view-profile-details.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Users controller', () => {
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

  describe('/users/me/profile-details', () => {
    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(ViewProfileDetailsService, 'go').resolves({
          pageTitle: 'Profile details'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions())

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Profile details')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and is valid', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitProfileDetailsService, 'go').resolves({})
          })

          it('redirects to itself', async () => {
            const response = await server.inject(_postOptions())

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/users/me/profile-details')
          })
        })

        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitProfileDetailsService, 'go').resolves({ error: { details: [] } })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions())

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })
})

function _getOptions() {
  return {
    method: 'GET',
    url: '/users/me/profile-details',
    auth: {
      strategy: 'session',
      credentials: { scope: ['hof_notifications'], user: { id: 1000 } }
    }
  }
}

function _postOptions() {
  return postRequestOptions('/users/me/profile-details', {}, ['hof_notifications'])
}
