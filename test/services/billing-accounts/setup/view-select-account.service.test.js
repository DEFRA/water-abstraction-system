'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewSelectAccountService = require('../../../../app/services/billing-accounts/setup/view-select-account.service.js')

describe('Billing Accounts - Setup - Select Account Service', () => {
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
    it('returns page data for the view', async () => {
      const result = await ViewSelectAccountService.go(session.id)

      expect(result).to.equal({
        accountSelected: null,
        companyName: session.billingAccount.company.name,
        backLink: {
          href: `/system/billing-accounts/${session.billingAccount.id}`,
          text: 'Back'
        },
        pageTitle: 'Who should the bills go to?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
