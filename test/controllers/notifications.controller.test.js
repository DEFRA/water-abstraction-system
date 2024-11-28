'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ReturnsPeriodService = require('../../app/services/notifications/setup/returns-period.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Notifications Setup controller', () => {
  const basePath = '/notifications/setup'

  let options
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

  describe('notifications/setup/returns-period', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: basePath + '/returns-period',
          auth: {
            strategy: 'session',
            credentials: { scope: ['returns'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(ReturnsPeriodService, 'go').returns(_viewReturnsPeriod())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          const pageData = _viewReturnsPeriod()

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(pageData.activeNavBar)
          expect(response.payload).to.contain(pageData.pageTitle)
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
