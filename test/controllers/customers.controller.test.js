'use strict'

const { HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../app/lib/general.lib.js')

// Things we need to stub
const BillingAccountsService = require('../../app/services/customers/billing-accounts.service.js')
const ContactsService = require('../../app/services/customers/contacts.service.js')
const LicencesService = require('../../app/services/customers/licences.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Customers controller', () => {
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

  describe('/customers/{id}/billing-accounts', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/customers/${generateUUID()}/billing-accounts`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        Sinon.stub(BillingAccountsService, 'go').returns({ pageTitle: 'Billing accounts' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Billing accounts')
      })
    })
  })

  describe('/customers/{id}/contacts', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/customers/${generateUUID()}/contacts`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        Sinon.stub(ContactsService, 'go').returns({ pageTitle: 'Contacts' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Contacts')
      })
    })
  })

  describe('/customers/{id}/licences', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/customers/${generateUUID()}/licences`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        Sinon.stub(LicencesService, 'go').returns({ pageTitle: 'Licences' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Licences')
      })
    })
  })
})
