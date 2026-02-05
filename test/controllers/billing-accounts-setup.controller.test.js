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
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const InitiateSessionService = require('../../app/services/billing-accounts/setup/initiate-session.service.js')
const SubmitAccountService = require('../../app/services/billing-accounts/setup/submit-account.service.js')
const SubmitAccountTypeService = require('../../app/services/billing-accounts/setup/submit-account-type.service.js')
const SubmitContactService = require('../../app/services/billing-accounts/setup/submit-contact.service.js')
const SubmitExistingAccountService = require('../../app/services/billing-accounts/setup/submit-existing-account.service.js')
const SubmitExistingAddressService = require('../../app/services/billing-accounts/setup/submit-existing-address.service.js')
const ViewAccountService = require('../../app/services/billing-accounts/setup/view-account.service.js')
const ViewAccountTypeService = require('../../app/services/billing-accounts/setup/view-account-type.service.js')
const ViewContactService = require('../../app/services/billing-accounts/setup/view-contact.service.js')
const ViewExistingAccountService = require('../../app/services/billing-accounts/setup/view-existing-account.service.js')
const ViewExistingAddressService = require('../../app/services/billing-accounts/setup/view-existing-address.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Billing Accounts Setup controller', () => {
  let billingAccountId
  let options
  let server
  let sessionId

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

  describe('/billing-accounts/setup/{billingAccountId}', () => {
    describe('POST', () => {
      beforeEach(() => {
        billingAccountId = generateUUID()
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${billingAccountId}`)
      })

      describe('when this url ', () => {
        beforeEach(() => {
          Sinon.stub(InitiateSessionService, 'go').resolves({ id: sessionId })
        })

        it('creates a new session and redirects to the "Who should the bills go to" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/account`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/account', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/account`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ViewAccountService, 'go').resolves({
            pageTitle: 'Who should the bills go to?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Who should the bills go to?')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/account`)
      })

      describe('when the user selects existing customer option', () => {
        beforeEach(() => {
          Sinon.stub(SubmitAccountService, 'go').resolves({
            accountSelected: 'customer'
          })
        })

        it('redirects to the "select company address" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/existing-address`)
        })
      })

      describe('when the user selects another billing account option', () => {
        beforeEach(() => {
          Sinon.stub(SubmitAccountService, 'go').resolves({
            accountSelected: 'another'
          })
        })

        it('redirects to the "does this account already exist" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/existing-account`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/existing-address', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/existing-address`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ViewExistingAddressService, 'go').resolves({
            pageTitle: 'Select an existing address for Test User?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Select an existing address for Test User?')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/existing-address`)
      })

      describe('when the user selects an existing address option', () => {
        beforeEach(() => {
          Sinon.stub(SubmitExistingAddressService, 'go').resolves({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/fao`
          })
        })

        it('redirects to the "fao" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/fao`)
        })
      })

      describe('when the user selects to set up a new address', () => {
        beforeEach(() => {
          Sinon.stub(SubmitExistingAddressService, 'go').resolves({
            redirectUrl: `/system/address/${sessionId}/postcode`
          })
        })

        it('redirects to the "postcode" page of the address lookup journey', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/address/${sessionId}/postcode`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/existing-account', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/existing-account`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ViewExistingAccountService, 'go').resolves({
            pageTitle: 'Does this account already exist?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Does this account already exist?')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/existing-account`)
      })

      describe('when the user selects an existing account option', () => {
        beforeEach(() => {
          Sinon.stub(SubmitExistingAccountService, 'go').resolves({
            redirectUrl: `/system/address/${sessionId}/postcode`
          })
        })

        it('redirects to the "postcode" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/address/${sessionId}/postcode`)
        })
      })

      describe('when the user selects to set up a new account', () => {
        beforeEach(() => {
          Sinon.stub(SubmitExistingAccountService, 'go').resolves({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/account-type`
          })
        })

        it('redirects to the "Select the account type" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/account-type`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/account-type', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/account-type`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ViewAccountTypeService, 'go').resolves({
            pageTitle: 'Select the account type'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Select the account type')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/account-type`)
      })

      describe('when the user selects an to set up an "individual" account', () => {
        beforeEach(() => {
          Sinon.stub(SubmitAccountTypeService, 'go').resolves({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/existing-address`
          })
        })

        it('redirects to the "existing-address" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/existing-address`)
        })
      })

      describe('when the user selects an to set up a "company" account', () => {
        beforeEach(() => {
          Sinon.stub(SubmitAccountTypeService, 'go').resolves({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/company-search`
          })
        })

        it('redirects to the "company search" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/company-search`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/contact', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/contact`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ViewContactService, 'go').resolves({
            pageTitle: 'Set up a contact for Company Name'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Set up a contact for Company Name')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/contact`)
      })

      describe('when the user selects a new contact option', () => {
        beforeEach(() => {
          Sinon.stub(SubmitContactService, 'go').resolves({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/contact-name`
          })
        })

        it('redirects to the "contact name" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/contact-name`)
        })
      })
    })
  })
})

function _getRequestOptions(path) {
  return {
    method: 'GET',
    url: path,
    auth: {
      strategy: 'session',
      credentials: { scope: ['manage_billing_accounts'] }
    }
  }
}

function _postRequestOptions(path) {
  return postRequestOptions(path, {}, ['manage_billing_accounts'])
}
