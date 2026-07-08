'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')

// Things we need to stub
const FetchViewBillingAccountService = require('../../../../app/services/billing-accounts/fetch-view-billing-account.service.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/billing-accounts/setup/initiate-session.service.js')

describe('Billing Accounts - Setup - Initiate Session service', () => {
  const billingAccountData = BillingAccountsFixture.billingAccount()
  const billingAccount = billingAccountData.billingAccount

  describe('when called', () => {
    beforeAll(async () => {
      Sinon.stub(FetchViewBillingAccountService, 'go').returns(billingAccountData)
    })

    it('creates a new session record containing details of the billing account', async () => {
      const result = await InitiateSessionService(billingAccount.id)

      expect(result.data).toEqual({
        billingAccount
      })
    })
  })
})
