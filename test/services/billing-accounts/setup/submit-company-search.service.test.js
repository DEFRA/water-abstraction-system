'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCompanySearchService = require('../../../../app/services/billing-accounts/setup/submit-company-search.service.js')

describe('Billing Accounts - Setup - Submit Company Search Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when the use submits a search term', () => {
    beforeEach(async () => {
      payload = {
        companySearch: 'Company Name'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.companySearch).to.equal(payload.companySearch)
    })

    it('continues the journey', async () => {
      const result = await SubmitCompanySearchService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/select-company`
      })
    })
  })

  describe('and the user has returned to the page and made the same choice', () => {
    beforeEach(async () => {
      sessionData = {
        billingAccount,
        companySearch: 'Company Name'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.companySearch).to.equal(payload.companySearch)
    })

    it('continues the journey', async () => {
      const result = await SubmitCompanySearchService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/select-company`
      })
    })
  })

  describe('and the user has returned to the page from the check page and made the same choice', () => {
    beforeEach(async () => {
      sessionData = {
        billingAccount,
        checkPageVisited: true,
        companySearch: 'Company Name'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.companySearch).to.equal(payload.companySearch)
    })

    it('continues the journey', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          checkPageVisited: true,
          companySearch: payload.companySearch
        },
        { skip: ['billingAccount'] }
      )
    })
  })

  describe('and the user has returned to the page from the check page and made a different choice', () => {
    beforeEach(async () => {
      sessionData = {
        billingAccount,
        checkPageVisited: true,
        companySearch: 'Company Ltd'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.companySearch).to.equal(payload.companySearch)
    })

    it('continues the journey', async () => {
      await SubmitCompanySearchService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressJourney: null,
          addressSelected: null,
          checkPageVisited: false,
          companiesHouseId: false,
          companySearch: payload.companySearch,
          contactSelected: null,
          contactName: null,
          fao: null
        },
        { skip: ['billingAccount'] }
      )
    })
  })

  describe('when validation fails', () => {
    describe('because nothing was entered', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitCompanySearchService.go(session.id, payload)

        expect(result.error).to.equal({
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

        expect(result.error).to.equal({
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
