'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const Boom = require('@hapi/boom')
const ChangeAddressService = require('../../app/services/billing-accounts/change-address.service.js')
const ViewBillingAccountService = require('../../app/services/billing-accounts/view-billing-account.service.js')

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

  describe('/billing-accounts/{billingAccountId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/billing-accounts/2e71429d-3fd1-4ed1-a45e-eb5616873018',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ViewBillingAccountService, 'go').resolves(_viewBillingAccount())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Billing account for Ferns Surfacing Limited')
        })
      })
    })
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

function _viewBillingAccount() {
  return {
    activeNavBar: 'search',
    accountNumber: 'S88897992A',
    address: ['Ferns Surfacing Limited', 'Tutsham Farm', 'West Farleigh', 'Maidstone', 'Kent', 'Me15 0ne'],
    billingAccountId: '9b03843e-848b-497e-878e-4a6628d4f683',
    bills: [
      {
        billId: '3d1b5d1f-9b57-4a28-bde1-1d57cd77b203',
        billNumber: 'SAI0297399',
        billRunNumber: 607,
        billRunType: 'Annual',
        billTotal: '£103.84',
        dateCreated: '6 April 2020',
        financialYear: 2021
      }
    ],
    createdDate: '14 December 2023',
    customerFile: 'naltc0001',
    lastUpdated: '6 May 2025',
    licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
    pageTitle: 'Billing account for Ferns Surfacing Limited',
    pagination: { numberOfPages: 1 }
  }
}
