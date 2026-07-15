// Test helpers
import { generateUUID } from '../../app/lib/general.lib.js'
import http2 from 'node:http2'

// Things we need to stub
import * as InitiateEditSessionService from '../../app/services/company-contacts/setup/initiate-edit-session.service.js'
import * as InitiateSessionService from '../../app/services/company-contacts/setup/initiate-session.service.js'
import * as SubmitAbstractionAlertsService from '../../app/services/company-contacts/setup/submit-abstraction-alerts.service.js'
import * as SubmitCancelService from '../../app/services/company-contacts/setup/submit-cancel.service.js'
import * as SubmitCheckService from '../../app/services/company-contacts/setup/submit-check.service.js'
import * as SubmitContactEmailService from '../../app/services/company-contacts/setup/submit-contact-email.service.js'
import * as SubmitContactNameService from '../../app/services/company-contacts/setup/submit-contact-name.service.js'
import * as SubmitLicencesService from '../../app/services/company-contacts/setup/submit-licences.service.js'
import * as SubmitRestoreService from '../../app/services/company-contacts/setup/submit-restore.service.js'
import * as ViewAbstractionAlertsService from '../../app/services/company-contacts/setup/view-abstraction-alerts.service.js'
import * as ViewCancelService from '../../app/services/company-contacts/setup/view-cancel.service.js'
import * as ViewCheckService from '../../app/services/company-contacts/setup/view-check.service.js'
import * as ViewContactEmailService from '../../app/services/company-contacts/setup/view-contact-email.service.js'
import * as ViewContactNameService from '../../app/services/company-contacts/setup/view-contact-name.service.js'
import * as ViewLicencesService from '../../app/services/company-contacts/setup/view-licences.service.js'
import * as ViewRestoreService from '../../app/services/company-contacts/setup/view-restore.service.js'

// For running our service
import { init } from '../../app/server.js'

import { postRequestOptions } from '../support/general.js'

const { HTTP_STATUS_OK, HTTP_STATUS_FOUND } = http2.constants

describe('Company Contacts Setup controller', () => {
  let options
  let postOptions
  let server
  let sessionId

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

  describe('/company-contacts/setup/{companyId}', () => {
    let id

    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        id = generateUUID()

        vi.spyOn(InitiateSessionService, 'default').mockReturnValue({ id })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/company-contacts/setup/${id}/contact-name`)
      })
    })
  })

  describe('/company-contacts/setup/{companyContactId}/edit', () => {
    let id

    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/edit`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        id = generateUUID()

        vi.spyOn(InitiateEditSessionService, 'default').mockReturnValue({ id })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/company-contacts/setup/${id}/check`)
      })
    })
  })

  describe('/company-contacts/setup/{id}/abstraction-alerts', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/abstraction-alerts`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewAbstractionAlertsService, 'default').mockReturnValue({ pageTitle: 'Abstraction alerts' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Abstraction alerts')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/abstraction-alerts`, {}, [
          'hof_notifications'
        ])

        vi.spyOn(SubmitAbstractionAlertsService, 'default').mockReturnValue({
          redirectUrl: `/system/company-contacts/setup/${sessionId}/check`
        })
      })

      it('redirects to companies contacts setup check page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/company-contacts/setup/${sessionId}/check`)
      })
    })
  })

  describe('/company-contacts/setup/{id}/cancel', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/cancel`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewCancelService, 'default').mockReturnValue({ pageTitle: 'Cancel' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Cancel')
      })
    })

    describe('POST', () => {
      let companyId

      beforeEach(() => {
        sessionId = generateUUID()

        companyId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/cancel`, {}, ['hof_notifications'])

        vi.spyOn(SubmitCancelService, 'default').mockReturnValue({
          redirectUrl: `/system/companies/${companyId}/contacts`
        })
      })

      it('redirects to companies contacts setup contact email page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/companies/${companyId}/contacts`)
      })
    })
  })

  describe('/company-contacts/setup/{id}/check', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/check`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewCheckService, 'default').mockReturnValue({ pageTitle: 'Check' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Check')
      })
    })

    describe('POST', () => {
      let companyId

      beforeEach(() => {
        sessionId = generateUUID()

        companyId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/check`, {}, ['hof_notifications'])

        vi.spyOn(SubmitCheckService, 'default').mockReturnValue({
          redirectUrl: `/system/companies/${companyId}/contacts`
        })
      })

      it('redirects to companies contacts setup contact email page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/companies/${companyId}/contacts`)
      })
    })
  })

  describe('/company-contacts/setup/{id}/contact-name', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/contact-name`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewContactNameService, 'default').mockReturnValue({ pageTitle: 'Contact name' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Contact name')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/contact-name`, {}, ['hof_notifications'])

        vi.spyOn(SubmitContactNameService, 'default').mockReturnValue({
          redirectUrl: `/system/company-contacts/setup/${sessionId}/contact-email`
        })
      })

      it('redirects to companies contacts setup contact email page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/company-contacts/setup/${sessionId}/contact-email`)
      })
    })
  })

  describe('/company-contacts/setup/{id}/contact-email', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/contact-email`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewContactEmailService, 'default').mockReturnValue({ pageTitle: 'Contact email' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Contact email')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/contact-email`, {}, [
          'hof_notifications'
        ])

        vi.spyOn(SubmitContactEmailService, 'default').mockReturnValue({
          redirectUrl: `/system/company-contacts/setup/${sessionId}/abstraction-alerts`
        })
      })

      it('redirects to companies contacts check page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/company-contacts/setup/${sessionId}/abstraction-alerts`)
      })
    })
  })

  describe('/company-contacts/setup/{id}/licences', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/licences`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewLicencesService, 'default').mockReturnValue({ pageTitle: 'Licences' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Licences')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/licences`, {}, ['hof_notifications'])

        vi.spyOn(SubmitLicencesService, 'default').mockReturnValue({
          redirectUrl: `/system/company-contacts/setup/${sessionId}/check`
        })
      })

      it('redirects to the company contacts setup check page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/company-contacts/setup/${sessionId}/check`)
      })
    })
  })

  describe('/company-contacts/setup/{id}/restore', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/company-contacts/setup/${generateUUID()}/restore`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewRestoreService, 'default').mockReturnValue({ pageTitle: 'Restore' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Restore')
      })
    })

    describe('POST', () => {
      let companyId

      beforeEach(() => {
        companyId = generateUUID()
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/restore`, {}, ['hof_notifications'])

        vi.spyOn(SubmitRestoreService, 'default').mockReturnValue({
          redirectUrl: `/system/companies/${companyId}/contacts`
        })
      })

      it('redirects to companies contacts check page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/companies/${companyId}/contacts`)
      })
    })
  })
})
