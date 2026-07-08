// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants
import { generateUUID } from '../../app/lib/general.lib.js'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import InitiateSessionService from '../../app/services/billing-accounts/setup/initiate-session.service.js'
import SubmitAccountService from '../../app/services/billing-accounts/setup/submit-account.service.js'
import SubmitAccountTypeService from '../../app/services/billing-accounts/setup/submit-account-type.service.js'
import SubmitCheckService from '../../app/services/billing-accounts/setup/submit-check.service.js'
import SubmitCompanySearchService from '../../app/services/billing-accounts/setup/submit-company-search.service.js'
import SubmitContactService from '../../app/services/billing-accounts/setup/submit-contact.service.js'
import SubmitContactNameService from '../../app/services/billing-accounts/setup/submit-contact-name.service.js'
import SubmitExistingAccountService from '../../app/services/billing-accounts/setup/submit-existing-account.service.js'
import SubmitExistingAddressService from '../../app/services/billing-accounts/setup/submit-existing-address.service.js'
import SubmitFaoService from '../../app/services/billing-accounts/setup/submit-fao.service.js'
import SubmitSelectCompanyService from '../../app/services/billing-accounts/setup/submit-select-company.service.js'
import ViewAccountService from '../../app/services/billing-accounts/setup/view-account.service.js'
import ViewAccountTypeService from '../../app/services/billing-accounts/setup/view-account-type.service.js'
import ViewCheckService from '../../app/services/billing-accounts/setup/view-check.service.js'
import ViewCompanySearchService from '../../app/services/billing-accounts/setup/view-company-search.service.js'
import ViewContactService from '../../app/services/billing-accounts/setup/view-contact.service.js'
import ViewContactNameService from '../../app/services/billing-accounts/setup/view-contact-name.service.js'
import ViewExistingAccountService from '../../app/services/billing-accounts/setup/view-existing-account.service.js'
import ViewExistingAddressService from '../../app/services/billing-accounts/setup/view-existing-address.service.js'
import ViewFaoService from '../../app/services/billing-accounts/setup/view-fao.service.js'
import ViewSelectCompanyService from '../../app/services/billing-accounts/setup/view-select-company.service.js'

// For running our service
import { init } from '../../app/server.js'

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
          vi.mock('../../app/services/billing-accounts/setup/initiate-session.service.js')
          InitiateSessionService.mockResolvedValue({ id: sessionId })
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
          vi.mock('../../app/services/billing-accounts/setup/view-account.service.js')
          ViewAccountService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-account.service.js')
          SubmitAccountService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-account.service.js')
          SubmitAccountService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-existing-address.service.js')
          ViewExistingAddressService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-existing-address.service.js')
          SubmitExistingAddressService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-existing-address.service.js')
          SubmitExistingAddressService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-existing-account.service.js')
          ViewExistingAccountService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-existing-account.service.js')
          SubmitExistingAccountService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-existing-account.service.js')
          SubmitExistingAccountService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-account-type.service.js')
          ViewAccountTypeService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-account-type.service.js')
          SubmitAccountTypeService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-account-type.service.js')
          SubmitAccountTypeService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-contact.service.js')
          ViewContactService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-contact.service.js')
          SubmitContactService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-contact-name.service.js')
          ViewContactNameService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-contact-name.service.js')
          SubmitContactNameService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-account-type.service.js')
          ViewAccountTypeService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-account-type.service.js')
          SubmitAccountTypeService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-account-type.service.js')
          SubmitAccountTypeService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-company-search.service.js')
          ViewCompanySearchService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-company-search.service.js')
          SubmitCompanySearchService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-select-company.service.js')
          ViewSelectCompanyService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-select-company.service.js')
          SubmitSelectCompanyService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-fao.service.js')
          ViewFaoService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-fao.service.js')
          SubmitFaoService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-fao.service.js')
          SubmitFaoService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/view-check.service.js')
          ViewCheckService.mockResolvedValue({
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
          vi.mock('../../app/services/billing-accounts/setup/submit-check.service.js')
          SubmitCheckService.mockResolvedValue({
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
