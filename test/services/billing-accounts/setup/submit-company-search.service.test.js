'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitCompanySearchService = require('../../../../app/services/billing-accounts/setup/submit-company-search.service.js')

describe('Billing Accounts - Setup - Submit Company Search Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  let fetchSessionStub
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the use submits a search term', () => {
    beforeEach(() => {
      payload = {
        companySearch: 'Company Name'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      expect(session.companySearch).toEqual(payload.companySearch)
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitCompanySearchService.go(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/select-company`
      })
    })
  })

  describe('and the user has returned to the page and made the same choice', () => {
    beforeEach(() => {
      sessionData = {
        billingAccount,
        companySearch: 'Company Name'
      }

      session = SessionModelStub.build(Sinon, sessionData)

      fetchSessionStub.resolves(session)
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      expect(session.companySearch).toEqual(payload.companySearch)
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitCompanySearchService.go(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/select-company`
      })
    })
  })

  describe('and the user has returned to the page from the check page and made the same choice', () => {
    beforeEach(() => {
      sessionData = {
        billingAccount,
        checkPageVisited: true,
        companySearch: 'Company Name'
      }

      session = SessionModelStub.build(Sinon, sessionData)

      fetchSessionStub.resolves(session)
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      expect(session.companySearch).toEqual(payload.companySearch)
      expect(session.checkPageVisited).toEqual(true)
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      expect(session).toMatchObject({
        checkPageVisited: true,
        companySearch: payload.companySearch
      })
      expect(session.$update.called).toBe(true)
    })
  })

  describe('and the user has returned to the page from the check page and made a different choice', () => {
    beforeEach(() => {
      sessionData = {
        billingAccount,
        checkPageVisited: true,
        companySearch: 'Company Ltd'
      }

      session = SessionModelStub.build(Sinon, sessionData)

      fetchSessionStub.resolves(session)
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      expect(session.companySearch).toEqual(payload.companySearch)
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      expect(session).toMatchObject({
        addressJourney: null,
        addressSelected: null,
        checkPageVisited: false,
        companiesHouseNumber: false,
        companySearch: payload.companySearch,
        contactSelected: null,
        contactName: null,
        fao: null
      })
    })
  })

  describe('when validation fails', () => {
    describe('because nothing was entered', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitCompanySearchService.go(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#companySearch',
              text: 'Enter the Companies House number or company name'
            }
          ],
          companySearch: {
            text: 'Enter the Companies House number or company name'
          }
        })
      })
    })

    describe('because too many characters were entered', () => {
      beforeEach(() => {
        payload = {
          companySearch: 'a'.repeat(101)
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitCompanySearchService.go(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#companySearch',
              text: 'Companies House number or company name must be 100 characters or less'
            }
          ],
          companySearch: {
            text: 'Companies House number or company name must be 100 characters or less'
          }
        })
      })
    })
  })
})
