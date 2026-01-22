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
const SubmitRemoveCompanyContactService = require('../../app/services/company-contacts/submit-remove-company-contact.service.js')
const ViewCompanyContactService = require('../../app/services/company-contacts/view-company-contact.service.js')
const ViewRemoveCompanyContactService = require('../../app/services/company-contacts/view-remove-company-contact.service.js')

// For running our service
const { init } = require('../../app/server.js')
const { postRequestOptions } = require('../support/general.js')

describe('Company Contacts controller', () => {
  let options
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

  describe('/company-contacts/{id}', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/${generateUUID()}`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        Sinon.stub(ViewCompanyContactService, 'go').returns({ pageTitle: 'Manage contact', roles: [] })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Manage contact')
      })
    })
  })

  describe('/company-contacts/{id}/remove', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/${generateUUID()}/remove`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        Sinon.stub(ViewRemoveCompanyContactService, 'go').returns({ pageTitle: 'Remove page' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Remove page')
      })
    })

    describe('POST', () => {
      let companyId

      beforeEach(() => {
        companyId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/${generateUUID()}/remove`, {}, ['hof_notifications'])

        Sinon.stub(SubmitRemoveCompanyContactService, 'go').returns({ companyId })
      })

      it('redirects to companies contacts page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/companies/${companyId}/contacts`)
      })
    })
  })
})
