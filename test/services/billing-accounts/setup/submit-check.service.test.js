'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/billing-accounts/setup/submit-check.service.js')

describe('Billing Accounts - Setup - Submit Check Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await SubmitCheckService.go(session.id)

      expect(result).to.equal({})
    })
  })
})
