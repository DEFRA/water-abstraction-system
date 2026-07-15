// Test helpers
import { generateUUID } from '../../app/lib/general.lib.js'
import http2 from 'node:http2'

// Things we need to stub
import * as ViewBillingAccountsService from '../../app/services/companies/view-billing-accounts.service.js'
import * as ViewCompanyService from '../../app/services/companies/view-company.service.js'
import * as ViewCompanyWithAddressService from '../../app/services/companies/view-company-with-address.service.js'
import * as ViewContactsService from '../../app/services/companies/view-contacts.service.js'
import * as ViewHistoryService from '../../app/services/companies/view-history.service.js'
import * as ViewLicencesService from '../../app/services/companies/view-licences.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_OK, HTTP_STATUS_NOT_FOUND } = http2.constants

describe('Companies controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

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

  describe('/companies/{id}/{role}', () => {
    describe('GET', () => {
      const role = 'licence-holder'

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/companies/${generateUUID()}/${role}`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        vi.spyOn(ViewCompanyService, 'default').mockReturnValue({ pageTitle: 'Licence holder' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Licence holder')
      })
    })
  })

  describe('/companies/{id}/address/{addressId}/{role}', () => {
    describe('GET', () => {
      const role = 'licence-holder'

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/companies/${generateUUID()}/address/${generateUUID()}/${role}`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        vi.spyOn(ViewCompanyWithAddressService, 'default').mockReturnValue({ pageTitle: 'Licence holder' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Licence holder')
      })
    })
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

          vi.spyOn(ViewBillingAccountsService, 'default').mockReturnValue({
            pageTitle: 'Billing accounts',
            roles: ['billing']
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Billing accounts')
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

          vi.spyOn(ViewBillingAccountsService, 'default').mockReturnValue({ pageTitle: 'Billing accounts', roles: [] })
        })

        it('returns "page not found"', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
          expect(response.payload).toContain('Page not found')
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

        vi.spyOn(ViewContactsService, 'default').mockReturnValue({ pageTitle: 'Contacts', roles: [] })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Contacts')
      })
    })
  })

  describe('/companies/{id}/history', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/companies/${generateUUID()}/history`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        vi.spyOn(ViewHistoryService, 'default').mockReturnValue({ pageTitle: 'History', roles: [] })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('History')
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

        vi.spyOn(ViewLicencesService, 'default').mockReturnValue({ pageTitle: 'Licences', roles: [] })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Licences')
      })
    })
  })
})
