// Test helpers
import http2 from 'node:http2'

// Things we need to stub
import Boom from '@hapi/boom'
import * as ChangeAddressService from '../../app/services/billing-accounts/change-address.service.js'
import * as ViewBillingAccountService from '../../app/services/billing-accounts/view-billing-account.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_CREATED, HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } =
  http2.constants

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
  beforeAll(async () => {
    server = await init()
  })

  // Create server before each test
  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('/billing-accounts/{billingAccountId}', () => {
    describe('GET', () => {
      describe('when a chargeVersionId and licenceId is passed as query parameters', () => {
        beforeEach(() => {
          options = {
            method: 'GET',
            url: '/billing-accounts/2e71429d-3fd1-4ed1-a45e-eb5616873018?licence-id=9a437fad-86b7-4495-8b26-061662cf8037&charge-version-id=0defacc2-6db7-4fdc-90e5-70a6d8f65235',
            auth: {
              strategy: 'session',
              credentials: { scope: ['billing'] }
            }
          }
        })

        describe('when the request succeeds', () => {
          beforeEach(() => {
            vi.spyOn(ViewBillingAccountService, 'default').mockResolvedValue(_viewBillingAccount())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Billing account for Ferns Surfacing Limited')
          })
        })
      })

      describe('when a licenceId is passed as a query parameter', () => {
        beforeEach(() => {
          options = {
            method: 'GET',
            url: '/billing-accounts/2e71429d-3fd1-4ed1-a45e-eb5616873018?licence-id=9a437fad-86b7-4495-8b26-061662cf8037',
            auth: {
              strategy: 'session',
              credentials: { scope: ['billing'] }
            }
          }
        })

        describe('when the request succeeds', () => {
          beforeEach(() => {
            vi.spyOn(ViewBillingAccountService, 'default').mockResolvedValue(_viewBillingAccount())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Billing account for Ferns Surfacing Limited')
          })
        })
      })

      describe('when no licenceId is passed as a query parameter', () => {
        beforeEach(() => {
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
          beforeEach(() => {
            vi.spyOn(ViewBillingAccountService, 'default').mockResolvedValue(_viewBillingAccount())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Billing account for Ferns Surfacing Limited')
          })
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

        vi.spyOn(ChangeAddressService, 'default').mockResolvedValue(validResponse)
      })

      it('returns a 201 status', async () => {
        const response = await server.inject(options)
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(HTTP_STATUS_CREATED)
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

          expect(response.statusCode).toEqual(HTTP_STATUS_BAD_REQUEST)
          expect(payload.message).toEqual('"address" is required')
        })
      })

      describe('because the address could not be changed', () => {
        beforeEach(async () => {
          options.payload = { ...validPayload }

          vi.spyOn(Boom, 'badImplementation').mockReturnValue(
            new Boom.Boom('Bang', { statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR })
          )
          vi.spyOn(ChangeAddressService, 'default').mockRejectedValue()
        })

        it('returns an error response', async () => {
          const response = await server.inject(options)
          const payload = JSON.parse(response.payload)

          expect(response.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          expect(payload.message).toEqual('An internal server error occurred')
        })
      })
    })
  })
})

function _viewBillingAccount() {
  return {
    accountNumber: 'S88897992A',
    address: [
      'Ferns Surfacing Limited',
      'FAO Test Testingson',
      'Tutsham Farm',
      'West Farleigh',
      'Maidstone',
      'Kent',
      'Me15 0ne'
    ],
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
    backLink: {
      title: 'Go back to bills',
      link: `/system/licences/9a437fad-86b7-4495-8b26-061662cf8037/bills`
    },
    pageTitle: 'Billing account for Ferns Surfacing Limited',
    pagination: { numberOfPages: 1 }
  }
}
