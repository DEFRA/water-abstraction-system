'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { after, afterEach, before, beforeEach, describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = require('node:http2').constants
const { generateUUID } = require('../../app/lib/general.lib.js')

// Things we need to stub
const InitiateExternalSessionService = require('../../app/services/users/external/setup/initiate-session.service.js')
const InitiateInternalEditSessionService = require('../../app/services/users/internal/setup/initiate-edit-session.service.js')
const InitiateInternalSessionService = require('../../app/services/users/internal/setup/initiate-session.service.js')
const SubmitExternalCancelService = require('../../app/services/users/external/setup/submit-cancel.service.js')
const SubmitExternalCheckService = require('../../app/services/users/external/setup/submit-check.service.js')
const SubmitExternalLicencesService = require('../../app/services/users/external/setup/submit-licences.service.js')
const SubmitInternalAccessService = require('../../app/services/users/internal/setup/submit-access.service.js')
const SubmitInternalCancelService = require('../../app/services/users/internal/setup/submit-cancel.service.js')
const SubmitInternalCheckService = require('../../app/services/users/internal/setup/submit-check.service.js')
const SubmitInternalEmailService = require('../../app/services/users/internal/setup/submit-email.service.js')
const SubmitInternalPermissionsService = require('../../app/services/users/internal/setup/submit-permissions.service.js')
const ViewExternalCancelService = require('../../app/services/users/external/setup/view-cancel.service.js')
const ViewExternalCheckService = require('../../app/services/users/external/setup/view-check.service.js')
const ViewExternalLicencesService = require('../../app/services/users/external/setup/view-licences.service.js')
const ViewInternalAccessService = require('../../app/services/users/internal/setup/view-access.service.js')
const ViewInternalCancelService = require('../../app/services/users/internal/setup/view-cancel.service.js')
const ViewInternalCheckService = require('../../app/services/users/internal/setup/view-check.service.js')
const ViewInternalEmailService = require('../../app/services/users/internal/setup/view-email.service.js')
const ViewInternalPermissionsService = require('../../app/services/users/internal/setup/view-permissions.service.js')

// For running our service
const { init } = require('../../app/server.js')

const { postRequestOptions } = require('../support/general.js')

describe('Users Setup controller', () => {
  const sessionId = generateUUID()

  let options
  let postOptions
  let server
  let userId

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(() => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await server.stop()
  })

  describe('/users/external/{id}/setup', () => {
    describe('POST', () => {
      beforeEach(() => {
        userId = generateUUID()

        postOptions = postRequestOptions(`/users/external/${userId}/setup`, {}, ['unlink_licences'])

        Sinon.stub(InitiateExternalSessionService, 'go').resolves({
          data: { selectedLicences: [], userId },
          id: sessionId
        })
      })

      it('initiates a session and redirects to the "Select the licences to unlink" page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/users/external/setup/${sessionId}/licences`)
      })
    })
  })

  describe('/users/external/setup/{sessionId}/cancel', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/external/setup/${sessionId}/cancel`, { scope: ['unlink_licences'] })

        Sinon.stub(ViewExternalCancelService, 'go').resolves({
          pageTitle: 'You are about to cancel unregistering these licences'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('You are about to cancel unregistering these licences')
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
          Sinon.stub(SubmitExternalCancelService, 'go').resolves({
            redirectUrl: `/system/users/external/${userId}/licences?back=users`
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/users/external/${userId}/licences?back=users`)
        })
      })
    })
  })

  describe('/users/external/setup/{sessionId}/check', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/external/setup/${sessionId}/check`, { scope: ['unlink_licences'] })

        Sinon.stub(ViewExternalCheckService, 'go').resolves({
          pageTitle: 'Check licences to unregister'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Check licences to unregister')
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
          Sinon.stub(SubmitExternalCheckService, 'go').resolves({
            redirectUrl: `/system/users/external/${userId}/licences?back=users`
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/users/external/${userId}/licences?back=users`)
        })
      })
    })
  })

  describe('/users/external/setup/{sessionId}/licences', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/external/setup/${sessionId}/licences`, { scope: ['unlink_licences'] })

        Sinon.stub(ViewExternalLicencesService, 'go').resolves({
          pageTitle: 'Select licences to unregister'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Select licences to unregister')
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
          Sinon.stub(SubmitExternalLicencesService, 'go').resolves({
            redirectUrl: `/system/users/external/setup/${sessionId}/check`
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/users/external/setup/${sessionId}/check`)
        })
      })
    })
  })

  describe('/users/internal/setup', () => {
    describe('GET', () => {
      const id = generateUUID()

      beforeEach(() => {
        options = _getOptions('/users/internal/setup', { scope: ['manage_accounts'] })

        Sinon.stub(InitiateInternalSessionService, 'go').resolves({ data: {}, id })
      })

      it('initiates a session and redirects to the "Enter an email address for the user" page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/users/internal/setup/${id}/email`)
      })
    })
  })

  describe('/users/internal/setup/{id}/edit', () => {
    describe('GET', () => {
      const id = generateUUID()
      const userId = generateUUID()

      beforeEach(() => {
        options = _getOptions(`/users/internal/setup/${userId}/edit`, { scope: ['manage_accounts'] })

        Sinon.stub(InitiateInternalEditSessionService, 'go').resolves({
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

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/users/internal/setup/${id}/check`)
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/access', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/access`, { scope: ['manage_accounts'] })

        Sinon.stub(ViewInternalAccessService, 'go').resolves({
          pageTitle: 'Select access for the user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Select access for the user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/access`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternalAccessService, 'go').resolves({
            redirectUrl: `/system/users/internal/setup/${sessionId}/check`
          })
        })

        it('redirects to the Check page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/users/internal/setup/${sessionId}/check`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternalAccessService, 'go').resolves({
            error: {
              errorList: [{ text: 'Select access for the user' }]
            },
            pageTitle: 'Select access for the user'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Select access for the user')
        })
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/cancel', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = _getOptions(`/users/internal/setup/${sessionId}/cancel`, { scope: ['manage_accounts'] })

        Sinon.stub(ViewInternalCancelService, 'go').resolves({
          pageTitle: 'You are about to cancel this user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('You are about to cancel this user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/cancel`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternalCancelService, 'go').resolves({
            redirectUrl: '/system/users'
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal('/system/users')
        })
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/check', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/check`, { scope: ['manage_accounts'] })

        Sinon.stub(ViewInternalCheckService, 'go').resolves({
          pageTitle: 'Check user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Check user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/check`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternalCheckService, 'go').resolves({
            redirectUrl: '/system/users'
          })
        })

        it('redirects to the Users page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal('/system/users')
        })
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/email', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/email`, { scope: ['manage_accounts'] })

        Sinon.stub(ViewInternalEmailService, 'go').resolves({
          pageTitle: 'Enter an email address for the user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Enter an email address for the user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/email`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternalEmailService, 'go').resolves({
            redirectUrl: `/system/users/internal/setup/${sessionId}/permissions`
          })
        })

        it('redirects to the Select permissions for the user page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/users/internal/setup/${sessionId}/permissions`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternalEmailService, 'go').resolves({
            error: {
              errorList: [{ text: 'Enter a gov.uk email address, like name@environment-agency.gov.uk' }]
            },
            pageTitle: 'Enter an email address for the user'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Enter a gov.uk email address, like name@environment-agency.gov.uk')
          expect(response.payload).to.contain('Enter an email address for the user')
        })
      })
    })
  })

  describe('/users/internal/setup/{sessionId}/permissions', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/permissions`, { scope: ['manage_accounts'] })

        Sinon.stub(ViewInternalPermissionsService, 'go').resolves({
          pageTitle: 'Select permissions for the user'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Select permissions for the user')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions(`/users/internal/setup/${sessionId}/permissions`, {}, ['manage_accounts'])
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternalPermissionsService, 'go').resolves({
            redirectUrl: `/system/users/internal/setup/${sessionId}/check`
          })
        })

        it('redirects to the Check page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/users/internal/setup/${sessionId}/check`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternalPermissionsService, 'go').resolves({
            error: {
              errorList: [{ text: 'Select a permission' }]
            },
            pageTitle: 'Select permissions for the user'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Select a permission')
          expect(response.payload).to.contain('Select permissions for the user')
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
