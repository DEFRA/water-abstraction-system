'use strict'

const { HTTP_STATUS_OK, HTTP_STATUS_NOT_FOUND } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../app/lib/general.lib.js')

// Things we need to stub
const ViewBillingAccountsService = require('../../app/services/companies/view-billing-accounts.service.js')
const ViewContactsService = require('../../app/services/companies/view-contacts.service.js')
const ViewLicencesService = require('../../app/services/companies/view-licences.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Companies controller', () => {
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

  describe('/companies/{id}/billing-accounts', () => {
    describe('GET', () => {
      describe('When the user has the correct permissions to view the page', () => {
        beforeEach(() => {
          options = {
            method: 'GET',
            url: `/companies/${generateUUID()}/billing-accounts`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['billing'] }
            }
          }

          Sinon.stub(ViewBillingAccountsService, 'go').returns({ pageTitle: 'Billing accounts', roles: ['billing'] })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Billing accounts')
        })
      })

      describe('When the user does not have the correct permissions to view the page', () => {
        beforeEach(() => {
          options = {
            method: 'GET',
            url: `/companies/${generateUUID()}/billing-accounts`,
            auth: {
              strategy: 'session',
              credentials: { scope: [] }
            }
          }

          Sinon.stub(ViewBillingAccountsService, 'go').returns({ pageTitle: 'Billing accounts', roles: [] })
        })

        it('returns "page not found"', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_NOT_FOUND)
          expect(response.payload).to.contain('Page not found')
        })
      })
    })
  })

  describe('/companies/{id}/contacts', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/companies/${generateUUID()}/contacts`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        Sinon.stub(ViewContactsService, 'go').returns({ pageTitle: 'Contacts', roles: [] })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Contacts')
      })
    })
  })

  describe('/companies/{id}/licences', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/companies/${generateUUID()}/licences`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        Sinon.stub(ViewLicencesService, 'go').returns({ pageTitle: 'Licences', roles: [] })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Licences')
      })
    })
  })
})
