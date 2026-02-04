'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewAccountService = require('../../../../app/services/billing-accounts/setup/view-account.service.js')

describe('Billing Accounts - Setup - View Account Service', () => {
  let session
  let sessionData

  before(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  after(async () => {
    await session.$query().delete()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAccountService.go(session.id)

      expect(result).to.equal({
        accountSelected: null,
        companyName: session.billingAccount.company.name,
        backLink: {
          href: `/system/billing-accounts/${session.billingAccount.id}`,
          text: 'Back'
        },
        pageTitle: 'Who should the bills go to?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchInput: null
      })
    })
  })
})
