'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewCheckService = require('../../../../app/services/billing-accounts/setup/view-check.service.js')

describe('Billing Accounts - Setup - View Check Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount,
      fao: 'no'
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckService.go(session.id)

      expect(result).to.equal({
        accountSelected: 'Another billing account',
        accountType: '',
        addressSelected: ['New'],
        companiesHouseName: '',
        companySearch: '',
        existingAccount: '',
        fao: 'no',
        links: {
          accountSelected: `/system/billing-accounts/setup/${session.id}/account`,
          accountType: `/system/billing-accounts/setup/${session.id}/account-type`,
          addressSelected: `/system/billing-accounts/setup/${session.id}/existing-address`,
          companiesHouseName: `/system/billing-accounts/setup/${session.id}/select-company`,
          companySearch: `/system/billing-accounts/setup/${session.id}/company-search`,
          existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`,
          fao: `/system/billing-accounts/setup/${session.id}/fao`
        },
        pageTitle: 'Check billing account details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchIndividualInput: '',
        searchInput: ''
      })
    })
  })
})
