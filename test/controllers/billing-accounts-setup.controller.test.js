// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'
import { generateUUID } from '../support/generators.js'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as InitiateSessionService from '../../app/services/billing-accounts/setup/initiate-session.service.js'
import * as SubmitAccountService from '../../app/services/billing-accounts/setup/submit-account.service.js'
import * as SubmitAccountTypeService from '../../app/services/billing-accounts/setup/submit-account-type.service.js'
import * as SubmitCheckService from '../../app/services/billing-accounts/setup/submit-check.service.js'
import * as SubmitCompanySearchService from '../../app/services/billing-accounts/setup/submit-company-search.service.js'
import * as SubmitContactNameService from '../../app/services/billing-accounts/setup/submit-contact-name.service.js'
import * as SubmitContactService from '../../app/services/billing-accounts/setup/submit-contact.service.js'
import * as SubmitExistingAccountService from '../../app/services/billing-accounts/setup/submit-existing-account.service.js'
import * as SubmitExistingAddressService from '../../app/services/billing-accounts/setup/submit-existing-address.service.js'
import * as SubmitFaoService from '../../app/services/billing-accounts/setup/submit-fao.service.js'
import * as SubmitSelectCompanyService from '../../app/services/billing-accounts/setup/submit-select-company.service.js'
import * as ViewAccountService from '../../app/services/billing-accounts/setup/view-account.service.js'
import * as ViewAccountTypeService from '../../app/services/billing-accounts/setup/view-account-type.service.js'
import * as ViewCheckService from '../../app/services/billing-accounts/setup/view-check.service.js'
import * as ViewCompanySearchService from '../../app/services/billing-accounts/setup/view-company-search.service.js'
import * as ViewContactNameService from '../../app/services/billing-accounts/setup/view-contact-name.service.js'
import * as ViewContactService from '../../app/services/billing-accounts/setup/view-contact.service.js'
import * as ViewExistingAccountService from '../../app/services/billing-accounts/setup/view-existing-account.service.js'
import * as ViewExistingAddressService from '../../app/services/billing-accounts/setup/view-existing-address.service.js'
import * as ViewFaoService from '../../app/services/billing-accounts/setup/view-fao.service.js'
import * as ViewSelectCompanyService from '../../app/services/billing-accounts/setup/view-select-company.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Billing Accounts Setup controller', () => {
  let billingAccountId
  let options
  let server
  let sessionId

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

  describe('/billing-accounts/setup/{billingAccountId}', () => {
    describe('POST', () => {
      beforeEach(() => {
        billingAccountId = generateUUID()
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${billingAccountId}`)
      })

      describe('when this url ', () => {
        beforeEach(() => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue({ id: sessionId })
        })

        it('creates a new session and redirects to the "Who should the bills go to" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/account`)
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
          vi.spyOn(ViewAccountService, 'default').mockResolvedValue({
            pageTitle: 'Who should the bills go to?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Who should the bills go to?')
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
          vi.spyOn(SubmitAccountService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/existing-address`
          })
        })

        it('redirects to the "select company address" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/existing-address`)
        })
      })

      describe('when the user selects another billing account option', () => {
        beforeEach(() => {
          vi.spyOn(SubmitAccountService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/existing-account`
          })
        })

        it('redirects to the "does this account already exist" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/existing-account`)
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
          vi.spyOn(ViewExistingAddressService, 'default').mockResolvedValue({
            pageTitle: 'Select an existing address for Test User?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select an existing address for Test User?')
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
          vi.spyOn(SubmitExistingAddressService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/fao`
          })
        })

        it('redirects to the "fao" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/fao`)
        })
      })

      describe('when the user selects to set up a new address', () => {
        beforeEach(() => {
          vi.spyOn(SubmitExistingAddressService, 'default').mockResolvedValue({
            redirectUrl: `/system/address/${sessionId}/postcode`
          })
        })

        it('redirects to the "postcode" page of the address lookup journey', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/address/${sessionId}/postcode`)
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
          vi.spyOn(ViewExistingAccountService, 'default').mockResolvedValue({
            pageTitle: 'Does this account already exist?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Does this account already exist?')
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
          vi.spyOn(SubmitExistingAccountService, 'default').mockResolvedValue({
            redirectUrl: `/system/address/${sessionId}/postcode`
          })
        })

        it('redirects to the "postcode" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/address/${sessionId}/postcode`)
        })
      })

      describe('when the user selects to set up a new account', () => {
        beforeEach(() => {
          vi.spyOn(SubmitExistingAccountService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/account-type`
          })
        })

        it('redirects to the "Select the account type" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/account-type`)
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
          vi.spyOn(ViewAccountTypeService, 'default').mockResolvedValue({
            pageTitle: 'Select the account type'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the account type')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/account-type`)
      })

      describe('when the user selects to set up an "individual" account', () => {
        beforeEach(() => {
          vi.spyOn(SubmitAccountTypeService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/existing-address`
          })
        })

        it('redirects to the "existing-address" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/existing-address`)
        })
      })

      describe('when the user selects to set up a "company" account', () => {
        beforeEach(() => {
          vi.spyOn(SubmitAccountTypeService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/company-search`
          })
        })

        it('redirects to the "company search" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/company-search`)
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
          vi.spyOn(ViewContactService, 'default').mockResolvedValue({
            pageTitle: 'Set up a contact for Company Name'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Set up a contact for Company Name')
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
          vi.spyOn(SubmitContactService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/contact-name`
          })
        })

        it('redirects to the "contact name" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/contact-name`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/contact-name', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/contact-name`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(ViewContactNameService, 'default').mockResolvedValue({
            pageTitle: 'Enter a name for the contact'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter a name for the contact')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/contact-name`)
      })

      describe('when the user enters a name for the contact', () => {
        beforeEach(() => {
          vi.spyOn(SubmitContactNameService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/check`
          })
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/check`)
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
          vi.spyOn(ViewAccountTypeService, 'default').mockResolvedValue({
            pageTitle: 'Select the account type'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the account type')
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
          vi.spyOn(SubmitAccountTypeService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/existing-address`
          })
        })

        it('redirects to the "existing-address" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/existing-address`)
        })
      })

      describe('when the user selects an to set up a "company" account', () => {
        beforeEach(() => {
          vi.spyOn(SubmitAccountTypeService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/company-search`
          })
        })

        it('redirects to the "company search" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/company-search`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/company-search', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/company-search`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(ViewCompanySearchService, 'default').mockResolvedValue({
            pageTitle: 'Enter the company details'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter the company details')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/company-search`)
      })

      describe('when the user enters a company name or company number', () => {
        beforeEach(() => {
          vi.spyOn(SubmitCompanySearchService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/select-company`
          })
        })

        it('redirects to the "select-company" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/select-company`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/select-company', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/select-company`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(ViewSelectCompanyService, 'default').mockResolvedValue({
            pageTitle: 'Select the registered company details'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the registered company details')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/select-company`)
      })

      describe('when the user selects a company', () => {
        beforeEach(() => {
          vi.spyOn(SubmitSelectCompanyService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/existing-address`
          })
        })

        it('redirects to the "existing-address" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/existing-address`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/fao', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/fao`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(ViewFaoService, 'default').mockResolvedValue({
            pageTitle: 'Do you need to add an FAO?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Do you need to add an FAO?')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/fao`)
      })

      describe('when the user selects "yes"', () => {
        beforeEach(() => {
          vi.spyOn(SubmitFaoService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/contact`
          })
        })

        it('redirects to the "contact" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/contact`)
        })
      })

      describe('when the user selects "no"', () => {
        beforeEach(() => {
          vi.spyOn(SubmitFaoService, 'default').mockResolvedValue({
            redirectUrl: `/system/billing-accounts/setup/${sessionId}/check`
          })
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/billing-accounts/setup/${sessionId}/check`)
        })
      })
    })
  })

  describe('/billing-accounts/setup/{sessionId}/check', () => {
    describe('GET', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _getRequestOptions(`/billing-accounts/setup/${sessionId}/check`)
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(ViewCheckService, 'default').mockResolvedValue({
            pageTitle: 'Check billing account details'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check billing account details')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        sessionId = generateUUID()
        options = _postRequestOptions(`/billing-accounts/setup/${sessionId}/check`)
      })

      describe('when the user clicks "Confirm"', () => {
        beforeEach(() => {
          vi.spyOn(SubmitCheckService, 'default').mockResolvedValue({
            redirectUrl: `system/billing-accounts/${billingAccountId}`
          })
        })

        it('redirects to the "confirmation" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`system/billing-accounts/${billingAccountId}`)
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
