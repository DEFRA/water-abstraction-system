'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const Boom = require('@hapi/boom')
const ChangeAddressService = require('../../app/services/billing-accounts/change-address.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Billing Accounts controller', () => {
  // Though the ChangeAddressValidator accepts a payload with an empty address PayLoadCleanerPlugin will strip it
  // out. So, we need at least one property to get through the cleaner.
  const validPayload = {
    address: {
      addressLine1: 'Building 12'
    }
  }

  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  // Create server before each test
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

  describe('POST /billing-accounts/{billingAccountId}/change-address', () => {
    beforeEach(() => {
      options = {
        method: 'POST',
        url: '/billing-accounts/7fa2f044-b29e-483a-99b6-e16db0db0f58/change-address',
        auth: {
          strategy: 'session',
          credentials: { scope: ['manage_billing_accounts'] }
        }
      }
    })

    describe('when a request is valid', () => {
      const validResponse = {
        billingAccountAddress: {},
        address: {},
        agentCompany: {},
        contact: {}
      }

      beforeEach(() => {
        options.payload = { ...validPayload }

        Sinon.stub(ChangeAddressService, 'go').resolves(validResponse)
      })

      it('returns a 201 status', async () => {
        const response = await server.inject(options)
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(201)
        expect(payload).to.equal(validResponse)
      })
    })

    describe('when the request fails', () => {
      describe('because the request is invalid', () => {
        beforeEach(() => {
          // This payload is invalid because it does not have an address property, which is required by
          // ChangeAddressValidator
          options.payload = {
            contact: {
              type: 'person'
            }
          }
        })

        it('returns an error response', async () => {
          const response = await server.inject(options)
          const payload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(400)
          expect(payload.message).to.equal('"address" is required')
        })
      })

      describe('because the address could not be changed', () => {
        beforeEach(async () => {
          options.payload = { ...validPayload }

          Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
          Sinon.stub(ChangeAddressService, 'go').rejects()
        })

        it('returns an error response', async () => {
          const response = await server.inject(options)
          const payload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(500)
          expect(payload.message).to.equal('An internal server error occurred')
        })
      })
    })
  })
})
