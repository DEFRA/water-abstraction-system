'use strict'

const { HTTP_STATUS_OK, HTTP_STATUS_FOUND } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../app/lib/general.lib.js')

// Things we need to stub
const InitiateSessionService = require('../../app/services/company-contacts/setup/initiate-session.service.js')
const SubmitAbstractionAlertsService = require('../../app/services/company-contacts/setup/submit-abstraction-alerts.service.js')
const SubmitCheckService = require('../../app/services/company-contacts/setup/submit-check.service.js')
const SubmitContactEmailService = require('../../app/services/company-contacts/setup/submit-contact-email.service.js')
const SubmitContactNameService = require('../../app/services/company-contacts/setup/submit-contact-name.service.js')
const ViewAbstractionAlertsService = require('../../app/services/company-contacts/setup/view-abstraction-alerts.service.js')
const ViewCheckService = require('../../app/services/company-contacts/setup/view-check.service.js')
const ViewContactEmailService = require('../../app/services/company-contacts/setup/view-contact-email.service.js')
const ViewContactNameService = require('../../app/services/company-contacts/setup/view-contact-name.service.js')

// For running our service
const { init } = require('../../app/server.js')

const { postRequestOptions } = require('../support/general.js')

describe('Company Contacts Setup controller', () => {
  let options
  let postOptions
  let server
  let sessionId

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

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

        Sinon.stub(InitiateSessionService, 'go').returns({ id })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/company-contacts/setup/${id}/contact-name`)
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

        Sinon.stub(ViewAbstractionAlertsService, 'go').returns({ pageTitle: 'Abstraction alerts' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Abstraction alerts')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/abstraction-alerts`, {}, [
          'hof_notifications'
        ])

        Sinon.stub(SubmitAbstractionAlertsService, 'go').returns({
          redirectUrl: `/system/company-contacts/setup/${sessionId}/check`
        })
      })

      it('redirects to companies contacts setup check page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/company-contacts/setup/${sessionId}/check`)
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

        Sinon.stub(ViewCheckService, 'go').returns({ pageTitle: 'Check' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Check')
      })
    })

    describe('POST', () => {
      let companyId

      beforeEach(() => {
        sessionId = generateUUID()

        companyId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/check`, {}, ['hof_notifications'])

        Sinon.stub(SubmitCheckService, 'go').returns({ redirectUrl: `/system/companies/${companyId}/contacts` })
      })

      it('redirects to companies contacts setup contact email page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/companies/${companyId}/contacts`)
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

        Sinon.stub(ViewContactNameService, 'go').returns({ pageTitle: 'Contact name' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Contact name')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/contact-name`, {}, ['hof_notifications'])

        Sinon.stub(SubmitContactNameService, 'go').returns({
          redirectUrl: `/system/company-contacts/setup/${sessionId}/contact-email`
        })
      })

      it('redirects to companies contacts setup contact email page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/company-contacts/setup/${sessionId}/contact-email`)
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

        Sinon.stub(ViewContactEmailService, 'go').returns({ pageTitle: 'Contact email' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Contact email')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()

        postOptions = postRequestOptions(`/company-contacts/setup/${sessionId}/contact-email`, {}, [
          'hof_notifications'
        ])

        Sinon.stub(SubmitContactEmailService, 'go').returns({
          redirectUrl: `/system/company-contacts/setup/${sessionId}/abstraction-alerts`
        })
      })

      it('redirects to companies contacts check page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
        expect(response.headers.location).to.equal(`/system/company-contacts/setup/${sessionId}/abstraction-alerts`)
      })
    })
  })
})
