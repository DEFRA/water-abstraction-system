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
const SubmitCompanyNameService = require('../../../../app/services/billing-accounts/setup/submit-company-name.service.js')

describe('Billing Accounts - Setup - Company Name Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { placeholder: 'change me' }
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
        companyName: 'Company Name'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitCompanyNameService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.companyName).to.equal(payload.companyName)
    })

    it('continues the journey', async () => {
      const result = await SubmitCompanyNameService.go(session.id, payload)

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
        const result = await SubmitCompanyNameService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#companyName',
              text: 'Enter the Companies House number or company name'
            }
          ],
          companyName: {
            text: 'Enter the Companies House number or company name'
          }
        })
      })
    })

    describe('because too many characters were entered', () => {
      beforeEach(() => {
        payload = {
          companyName: 'a'.repeat(101)
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitCompanyNameService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#companyName',
              text: 'Companies House number or company name must be 100 characters or less'
            }
          ],
          companyName: {
            text: 'Companies House number or company name must be 100 characters or less'
          }
        })
      })
    })
  })
})
