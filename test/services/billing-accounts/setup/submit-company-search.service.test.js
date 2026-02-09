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
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called', () => {
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
