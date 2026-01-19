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
const ViewManageService = require('../../app/services/customers/contact/view-manage.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Customers Contact controller', () => {
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

  describe('/customers/{customerId}contact/{contactId}', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/customers/${generateUUID()}/contact/${generateUUID()}`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        Sinon.stub(ViewManageService, 'go').returns({ pageTitle: 'Manage contact' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Manage contact')
      })
    })
  })
})
