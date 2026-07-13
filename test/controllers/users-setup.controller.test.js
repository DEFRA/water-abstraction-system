// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
import { generateUUID } from '../../app/lib/general.lib.js'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as InitiateExternalSessionService from '../../app/services/users/external/setup/initiate-session.service.js'
import * as InitiateInternalEditSessionService from '../../app/services/users/internal/setup/initiate-edit-session.service.js'
import * as InitiateInternalSessionService from '../../app/services/users/internal/setup/initiate-session.service.js'
import * as SubmitExternalCancelService from '../../app/services/users/external/setup/submit-cancel.service.js'
import * as SubmitExternalCheckService from '../../app/services/users/external/setup/submit-check.service.js'
import * as SubmitExternalLicencesService from '../../app/services/users/external/setup/submit-licences.service.js'
import * as SubmitInternalAccessService from '../../app/services/users/internal/setup/submit-access.service.js'
import * as SubmitInternalCancelService from '../../app/services/users/internal/setup/submit-cancel.service.js'
import * as SubmitInternalCheckService from '../../app/services/users/internal/setup/submit-check.service.js'
import * as SubmitInternalEmailService from '../../app/services/users/internal/setup/submit-email.service.js'
import * as SubmitInternalPermissionsService from '../../app/services/users/internal/setup/submit-permissions.service.js'
import * as ViewExternalCancelService from '../../app/services/users/external/setup/view-cancel.service.js'
import * as ViewExternalCheckService from '../../app/services/users/external/setup/view-check.service.js'
import * as ViewExternalLicencesService from '../../app/services/users/external/setup/view-licences.service.js'
import * as ViewInternalAccessService from '../../app/services/users/internal/setup/view-access.service.js'
import * as ViewInternalCancelService from '../../app/services/users/internal/setup/view-cancel.service.js'
import * as ViewInternalCheckService from '../../app/services/users/internal/setup/view-check.service.js'
import * as ViewInternalEmailService from '../../app/services/users/internal/setup/view-email.service.js'
import * as ViewInternalPermissionsService from '../../app/services/users/internal/setup/view-permissions.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Users Setup controller', () => {
  const sessionId = generateUUID()

  let options
  let postOptions
  let server
  let userId

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(() => {
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

  describe('/users/external/{id}/setup', () => {
    describe('POST', () => {
      beforeEach(() => {
        userId = generateUUID()

        postOptions = postRequestOptions(`/users/external/${userId}/setup`, {}, ['unlink_licences'])

        vi.spyOn(InitiateExternalSessionService, 'default').mockResolvedValue({
          data: { selectedLicences: [], userId },
          id: sessionId
        })
      })

      it('initiates a session and redirects to the "Select the licences to unlink" page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/users/external/setup/${sessionId}/licences`)
      })
    })
  })

  describe('/users/external/setup/{sessionId}/cancel', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/external/setup/${sessionId}/cancel`, { scope: ['unlink_licences'] })

        vi.spyOn(ViewExternalCancelService, 'default').mockResolvedValue({
          pageTitle: 'You are about to cancel unregistering these licences'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('You are about to cancel unregistering these licences')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        userId = generateUUID()

        postOptions = postRequestOptions(`/users/external/setup/${sessionId}/cancel`, {}, ['unlink_licences'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitExternalCancelService, 'default').mockResolvedValue({
            redirectUrl: `/system/users/external/${userId}/licences?back=users`
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/users/external/${userId}/licences?back=users`)
        })
      })
    })
  })

  describe('/users/external/setup/{sessionId}/check', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/external/setup/${sessionId}/check`, { scope: ['unlink_licences'] })

        vi.spyOn(ViewExternalCheckService, 'default').mockResolvedValue({
          pageTitle: 'Check licences to unregister'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check licences to unregister')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        userId = generateUUID()

        postOptions = postRequestOptions(`/users/external/setup/${sessionId}/check`, {}, ['unlink_licences'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitExternalCheckService, 'default').mockResolvedValue({
            redirectUrl: `/system/users/external/${userId}/licences?back=users`
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/users/external/${userId}/licences?back=users`)
        })
      })
    })
  })

  describe('/users/external/setup/{sessionId}/licences', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/external/setup/${sessionId}/licences`, { scope: ['unlink_licences'] })

        vi.spyOn(ViewExternalLicencesService, 'default').mockResolvedValue({
          pageTitle: 'Select licences to unregister'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select licences to unregister')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        userId = generateUUID()

        postOptions = postRequestOptions(`/users/external/setup/${sessionId}/licences`, {}, ['unlink_licences'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitExternalLicencesService, 'default').mockResolvedValue({
            redirectUrl: `/system/users/external/setup/${sessionId}/check`
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/users/external/setup/${sessionId}/check`)
        })
      })
    })
  })

  describe('/users/internal/setup', () => {
    describe('GET', () => {
      const id = generateUUID()

      beforeEach(() => {
        options = _getOptions('/users/internal/setup', { scope: ['manage_accounts'] })

        vi.spyOn(InitiateInternalSessionService, 'default').mockResolvedValue({ data: {}, id })
      })

      it('initiates a session and redirects to the "Enter an email address for the user" page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/users/internal/setup/${id}/email`)
      })
    })
  })

  describe('/users/internal/setup/{id}/edit', () => {
    describe('GET', () => {
      const id = generateUUID()
      const userId = generateUUID()

      beforeEach(() => {
        options = _getOptions(`/users/internal/setup/${userId}/edit`, { scope: ['manage_accounts'] })

        vi.spyOn(InitiateInternalEditSessionService, 'default').mockResolvedValue({
          data: {
            email: 'bob.bobbles@environment-agency.gov.uk',
            permission: 'basic',
            userId
          },
          id,
          email: 'bob.bobbles@environment-agency.gov.uk',
          permission: 'basic',
          userId
        })
      })

      it('initiates a session with the users data and redirects to the "Check user" page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/users/internal/setup/${id}/check`)
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/access', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/access`, { scope: ['manage_accounts'] })

        vi.spyOn(ViewInternalAccessService, 'default').mockResolvedValue({
          pageTitle: 'Select access for the user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select access for the user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/access`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternalAccessService, 'default').mockResolvedValue({
            redirectUrl: `/system/users/internal/setup/${sessionId}/check`
          })
        })

        it('redirects to the Check page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/users/internal/setup/${sessionId}/check`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternalAccessService, 'default').mockResolvedValue({
            error: {
              errorList: [{ text: 'Select access for the user' }]
            },
            pageTitle: 'Select access for the user'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select access for the user')
        })
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/cancel', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = _getOptions(`/users/internal/setup/${sessionId}/cancel`, { scope: ['manage_accounts'] })

        vi.spyOn(ViewInternalCancelService, 'default').mockResolvedValue({
          pageTitle: 'You are about to cancel this user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('You are about to cancel this user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/cancel`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternalCancelService, 'default').mockResolvedValue({
            redirectUrl: '/system/users'
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual('/system/users')
        })
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/check', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/check`, { scope: ['manage_accounts'] })

        vi.spyOn(ViewInternalCheckService, 'default').mockResolvedValue({
          pageTitle: 'Check user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/check`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternalCheckService, 'default').mockResolvedValue({
            redirectUrl: '/system/users'
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual('/system/users')
        })
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/email', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/email`, { scope: ['manage_accounts'] })

        vi.spyOn(ViewInternalEmailService, 'default').mockResolvedValue({
          pageTitle: 'Enter an email address for the user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter an email address for the user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/email`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternalEmailService, 'default').mockResolvedValue({
            redirectUrl: `/system/users/internal/setup/${sessionId}/permissions`
          })
        })

        it('redirects to the Select permissions for the user page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/users/internal/setup/${sessionId}/permissions`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternalEmailService, 'default').mockResolvedValue({
            error: {
              errorList: [{ text: 'Enter a gov.uk email address, like name@environment-agency.gov.uk' }]
            },
            pageTitle: 'Enter an email address for the user'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter a gov.uk email address, like name@environment-agency.gov.uk')
          expect(response.payload).toContain('Enter an email address for the user')
        })
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/permissions', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/permissions`, { scope: ['manage_accounts'] })

        vi.spyOn(ViewInternalPermissionsService, 'default').mockResolvedValue({
          pageTitle: 'Select permissions for the user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select permissions for the user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/permissions`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternalPermissionsService, 'default').mockResolvedValue({
            redirectUrl: `/system/users/internal/setup/${sessionId}/check`
          })
        })

        it('redirects to the Check page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/users/internal/setup/${sessionId}/check`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternalPermissionsService, 'default').mockResolvedValue({
            error: {
              errorList: [{ text: 'Select a permission' }]
            },
            pageTitle: 'Select permissions for the user'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select a permission')
          expect(response.payload).toContain('Select permissions for the user')
        })
      })
    })
  })
})

function _getOptions(url, credentials) {
  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials
    }
  }
}
