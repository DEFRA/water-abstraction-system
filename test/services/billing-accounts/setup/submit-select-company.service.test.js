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
const SubmitSelectCompanyService = require('../../../../app/services/billing-accounts/setup/submit-select-company.service.js')

describe('Billing Accounts - Setup - Submit Select Company Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { companiesHouseId: '12345678' }
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitSelectCompanyService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.companiesHouseId).to.equal(payload.companiesHouseId)
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectCompanyService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitSelectCompanyService.go(session.id, payload)

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#companiesHouseId',
            text: 'Select a company from the list'
          }
        ],
        companiesHouseId: { text: 'Select a company from the list' }
      })
    })
  })
})
