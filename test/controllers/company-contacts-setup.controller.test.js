'use strict'

const { HTTP_STATUS_OK, HTTP_STATUS_FOUND } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../app/lib/general.lib.js')

// Things we need to stub
const InitiateSessionService = require('../../app/services/company-contacts/setup/initiate-session.service.js')
const SubmitContactNameService = require('../../app/services/company-contacts/setup/submit-contact-name.service.js')
const ViewContactNameService = require('../../app/services/company-contacts/setup/view-contact-name.service.js')

// For running our service
const { init } = require('../../app/server.js')

const { postRequestOptions } = require('../support/general.js')

describe('Company Contacts Setup controller', () => {
  let options
  let postOptions
  let server
  let sessionId

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

  describe('/company-contacts/setup/{companyId}', () => {
    let id

    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        id = generateUUID()

        Sinon.stub(InitiateSessionService, 'go').returns({ id })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/company-contacts/setup/${id}/contact-name`)
      })
    })
  })

  describe('/company-contacts/setup/{id}/contact-name', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/contact-name`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        Sinon.stub(ViewContactNameService, 'go').returns({ pageTitle: 'Contact name' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Contact name')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/contact-name`, {}, ['hof_notifications'])

        Sinon.stub(SubmitContactNameService, 'go').returns({})
      })

      it('redirects to companies contacts page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/company-contacts/setup/${sessionId}/contact-email`)
      })
    })
  })
})
