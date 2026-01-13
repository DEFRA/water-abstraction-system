'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')

// Things we need to stub
const FetchViewBillingAccountService = require('../../../../app/services/billing-accounts/fetch-view-billing-account.service.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/billing-accounts/setup/initiate-session.service.js')

describe('Billing Accounts - Setup - Initiate Session service', () => {
  const billingAccountData = BillingAccountsFixture.billingAccount()
  const billingAccount = billingAccountData.billingAccount

  describe('when called', () => {
    before(async () => {
      Sinon.stub(FetchViewBillingAccountService, 'go').returns(billingAccountData)
    })

    it('creates a new session record containing details of the billing account', async () => {
      const result = await InitiateSessionService.go(billingAccount.id)

      expect(result.data).to.equal({
        billingAccount
      })
    })
  })
})
