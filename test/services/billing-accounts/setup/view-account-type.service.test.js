'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewAccountTypeService = require('../../../../app/services/billing-accounts/setup/view-account-type.service.js')

describe('Billing Accounts - Setup - Account Type Service', () => {
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
      const result = await ViewAccountTypeService.go(session.id)

      expect(result).to.equal({
        accountType: null,
        activeNavBar: 'search',
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/existing-account`,
          text: 'Back'
        },
        pageTitle: 'Select the account type',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchIndividualInput: null
      })
    })
  })
})
