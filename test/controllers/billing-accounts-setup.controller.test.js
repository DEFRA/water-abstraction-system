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
const ViewExistingAccountService = require('../../app/services/billing-accounts/setup/view-existing-account.service.js')
const ViewSelectExistingAddressService = require('../../app/services/billing-accounts/setup/view-select-existing-address.service.js')
const ViewSelectAccountService = require('../../app/services/billing-accounts/setup/view-select-account.service.js')
const SubmitExistingAccountService = require('../../app/services/billing-accounts/setup/submit-existing-account.service.js')
const SubmitSelectExistingAddressService = require('../../app/services/billing-accounts/setup/submit-select-existing-address.service.js')
const SubmitSelectAccountService = require('../../app/services/billing-accounts/setup/submit-select-account.service.js')

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
          expect(response.headers.location).to.equal(`/system/billing-accounts/setup/${sessionId}/select-account`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/select-account', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/select-account`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ViewSelectAccountService, 'go').resolves({
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
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/select-account`)
      })

      describe('when the user selects existing customer option', () => {
        beforeEach(() => {
          Sinon.stub(SubmitSelectAccountService, 'go').resolves({
            accountSelected: 'customer'
          })
        })

        it('redirects to the "select company address" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(
            `/system/billing-accounts/setup/${sessionId}/select-existing-address`
          )
        })
      })

      describe('when the user selects another billing account option', () => {
        beforeEach(() => {
          Sinon.stub(SubmitSelectAccountService, 'go').resolves({
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

  describe('/billing-accounts/setup/{sessionId}/select-existing-address', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/select-existing-address`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ViewSelectExistingAddressService, 'go').resolves({
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
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/select-existing-address`)
      })

      describe('when the user selects an existing address option', () => {
        beforeEach(() => {
          Sinon.stub(SubmitSelectExistingAddressService, 'go').resolves({
            addressSelected: 'existing'
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
          Sinon.stub(SubmitSelectExistingAddressService, 'go').resolves({
            addressSelected: 'new'
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
            addressSelected: 'existing'
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
            existingAccount: 'new'
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
