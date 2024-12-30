'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const InitiateSessionService = require('../../app/services/notifications/setup/initiate-session.service.js')
const ReturnsPeriodService = require('../../app/services/notifications/setup/returns-period.service.js')
const SubmitReturnsPeriodService = require('../../app/services/notifications/setup/submit-returns-period.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Notifications Setup controller', () => {
  const basePath = '/notifications/setup'
  const session = { id: 'e0c77b74-7326-493d-be5e-0d1ad41594b5', data: {} }

  let getOptions
  let postOptions
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

  describe('notifications/setup', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: '/notifications/setup',
          auth: {
            strategy: 'session',
            credentials: { scope: ['returns'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
        })

        it('redirects successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/notifications/setup/${session.id}/returns-period`)
        })
      })
    })
  })

  describe('notifications/setup/returns-period', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/returns-period`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['returns'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(ReturnsPeriodService, 'go').returns(_viewReturnsPeriod())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewReturnsPeriod()

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(pageData.activeNavBar)
          expect(response.payload).to.contain(pageData.pageTitle)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(InitiateSessionService, 'go').resolves(session)
            Sinon.stub(SubmitReturnsPeriodService, 'go').returns({
              ..._viewReturnsPeriod(),
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/returns-period`, {})
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReturnsPeriodService, 'go').returns({ redirect: 'send-notice' })
            postOptions = postRequestOptions(basePath + `/${session.id}/returns-period`, {})
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/notifications/setup/send-notice')
          })
        })
      })
    })
  })
})

function _viewReturnsPeriod() {
  return {
    pageTitle: 'Select the returns periods for the invitations',
    backLink: '/manage',
    activeNavBar: 'manage',
    returnsPeriod: []
  }
}
