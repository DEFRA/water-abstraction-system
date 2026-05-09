'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = require('node:http2').constants
const { generateUUID } = require('../../app/lib/general.lib.js')

// Things we need to stub
const InitiateExternalSessionService = require('../../app/services/users/external/setup/initiate-session.service.js')
const InitiateInternalSessionService = require('../../app/services/users/internal/setup/initiate-session.service.js')
const SubmitCheckService = require('../../app/services/users/internal/setup/submit-check.service.js')
const SubmitEmailService = require('../../app/services/users/internal/setup/submit-email.service.js')
const SubmitPermissionsService = require('../../app/services/users/internal/setup/submit-permissions.service.js')
const ViewCheckService = require('../../app/services/users/internal/setup/view-check.service.js')
const ViewEmailService = require('../../app/services/users/internal/setup/view-email.service.js')
const ViewPermissionsService = require('../../app/services/users/internal/setup/view-permissions.service.js')

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

  describe('/users/external/{id}/setup', () => {
    describe('GET', () => {
      const id = generateUUID()

      userId = generateUUID()

      beforeEach(() => {
        options = _getOptions(`/users/external/${userId}/setup`, { scope: ['manage_accounts'] })

        Sinon.stub(InitiateExternalSessionService, 'go').resolves({ data: { selectedLicences: [], userId }, id })
      })

      it('initiates a session and redirects to the "Select the licences to unlink" page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/users/external/setup/${id}/licences`)
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

  describe('/users/internal/setup/{sessionId}/check', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions(`/users/internal/setup/${sessionId}/check`, { scope: ['manage_accounts'] })

        Sinon.stub(ViewCheckService, 'go').resolves({
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
          Sinon.stub(SubmitCheckService, 'go').resolves()
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

        Sinon.stub(ViewEmailService, 'go').resolves({
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
          Sinon.stub(SubmitEmailService, 'go').resolves({
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
          Sinon.stub(SubmitEmailService, 'go').resolves({
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

        Sinon.stub(ViewPermissionsService, 'go').resolves({
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
          Sinon.stub(SubmitPermissionsService, 'go').resolves({
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
          Sinon.stub(SubmitPermissionsService, 'go').resolves({
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
