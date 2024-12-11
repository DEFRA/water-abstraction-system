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
const SubmitLicenceService = require('../../app/services/notifications/ad-hoc-returns/submit-licence.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Notifications Ad Hoc Returns controller', () => {
  const basePath = '/notifications/ad-hoc-returns'

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

  describe('notifications/ad-hoc-returns/licence', () => {
    const path = '/licence'

    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: basePath + path,
          auth: {
            strategy: 'session',
            credentials: { scope: ['returns'] }
          }
        }
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          const pageData = {
            pageTitle: 'Enter a licence number',
            activeNavBar: 'manage'
          }

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(pageData.activeNavBar)
          expect(response.payload).to.contain(pageData.pageTitle)
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitLicenceService, 'go').resolves({
            pageTitle: 'Check return details',
            activeNavBar: 'manage'
          })
        })

        it('returns the same page', async () => {
          const response = await server.inject(postRequestOptions(`${basePath}${path}`, {}, 'returns'))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter a licence number')
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitLicenceService, 'go').resolves({
            activeNavBar: 'manage',
            licenceRef: '01/115',
            error: { text: 'Please enter a Licence number' },
            pageTitle: 'Enter a licence number'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postRequestOptions(`${basePath}${path}`, {}, 'returns'))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Please enter a Licence number')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })
})
