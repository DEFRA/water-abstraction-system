'use strict'
/* global describe beforeEach it expect */
// Test framework dependencies
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

  // Create server before each test
  beforeEach(async () => {
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    server.logger.error = jest.fn().mockResolvedValue()

    // We silence sending a notification to our Errbit instance using Airbrake
    server.app.airbrake.notify = jest.fn().mockResolvedValue()
  })

  describe('POST /billing-accounts/{invoiceAccountId}/change-address', () => {
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
        invoiceAccountAddress: {},
        address: {},
        agentCompany: {},
        contact: {}
      }

      beforeEach(() => {
        options.payload = { ...validPayload }

        jest.spyOn(ChangeAddressService, 'go').mockResolvedValue(validResponse)
      })

      it('returns a 201 status', async () => {
        const response = await server.inject(options)
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(201)
        expect(payload).toEqual(validResponse)
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

          expect(response.statusCode).toEqual(400)
          expect(payload.message).toEqual('"address" is required')
        })
      })

      describe('because the address could not be changed', () => {
        beforeEach(async () => {
          jest.spyOn(ChangeAddressService, 'go').mockRejectedValue()
          jest.spyOn(Boom, 'badImplementation').mockResolvedValue(new Boom.Boom('Bang', { statusCode: 500 }))
        })

        it('returns an error response', async () => {
          const response = await server.inject(options)
          const payload = JSON.parse(response.payload)
          expect(response.statusCode).toEqual(400)
          expect(payload.error).toEqual('Bad Request')
        })

        it('returns a valid response', async () => {
          options.payload = { ...validPayload }
          const response = await server.inject(options)
          expect(response.statusCode).toEqual(200)
        })
      })
    })
  })
})
