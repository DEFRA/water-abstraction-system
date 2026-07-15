// Test helpers
import { generateUUID } from '../../app/lib/general.lib.js'
import http2 from 'node:http2'

// Things we need to stub
import * as SubmitRemoveCompanyContactService from '../../app/services/company-contacts/submit-remove-company-contact.service.js'
import * as ViewCommunicationsService from '../../app/services/company-contacts/view-communications.service.js'
import * as ViewContactDetailsService from '../../app/services/company-contacts/view-contact-details.service.js'
import * as ViewRemoveCompanyContactService from '../../app/services/company-contacts/view-remove-company-contact.service.js'

// For running our service
import { init } from '../../app/server.js'
import { postRequestOptions } from '../support/general.js'
const { HTTP_STATUS_OK, HTTP_STATUS_FOUND } = http2.constants

describe('Company Contacts controller', () => {
  let options
  let postOptions
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

  describe('/company-contacts/{id}/communications', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/${generateUUID()}/communications`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        vi.spyOn(ViewCommunicationsService, 'default').mockReturnValue({
          pageTitle: 'Communications for Rachael Tyrell'
        })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Communications for Rachael Tyrell')
      })
    })
  })

  describe('/company-contacts/{id}/contact-details', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/${generateUUID()}/contact-details`,
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        vi.spyOn(ViewContactDetailsService, 'default').mockReturnValue({
          pageTitle: 'Contact details for Rachael Tyrell',
          roles: []
        })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Contact details for Rachael Tyrell')
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

        vi.spyOn(ViewRemoveCompanyContactService, 'default').mockReturnValue({ pageTitle: 'Remove page' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Remove page')
      })
    })

    describe('POST', () => {
      let companyId

      beforeEach(() => {
        companyId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/${generateUUID()}/remove`, {}, ['hof_notifications'])

        vi.spyOn(SubmitRemoveCompanyContactService, 'default').mockReturnValue({ companyId })
      })

      it('redirects to companies contacts page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/companies/${companyId}/contacts`)
      })
    })
  })
})
