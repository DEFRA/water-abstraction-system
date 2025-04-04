'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const IndexNotificationsService = require('../../app/services/notifications/index.service.js')
const SubmitIndexNotificationsService = require('../../app/services/notifications/submit-index.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Notifications controller', () => {
  const basePath = '/notifications'

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

  describe('notifications', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath,
          auth: {
            strategy: 'session',
            credentials: { scope: ['returns'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(IndexNotificationsService, 'go').returns({
            backLink: '/manage',
            error: null,
            filter: undefined,
            headers: [
              {
                text: 'Date'
              },
              {
                text: 'Notification type'
              },
              {
                text: 'Sent by'
              },
              {
                text: 'Recipients'
              },
              {
                text: 'Problems'
              }
            ],
            rows: [],
            pageTitle: 'View sent notices'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('manage')
          expect(response.payload).to.contain('View sent notices')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitIndexNotificationsService, 'go').returns()
          postOptions = postRequestOptions(basePath, {})
        })

        it('redirects the to the next page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/notifications`)
        })
      })
    })
  })
})
