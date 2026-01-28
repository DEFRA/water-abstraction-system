'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchCompanyDetailsService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')

// Thing under test
const ViewExistingAccountService = require('../../../../app/services/billing-accounts/setup/view-existing-account.service.js')

describe('Billing Accounts - Setup - View Existing Account service', () => {
  const fetchResults = _companies()
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      searchInput: 'Company Name'
    }

    session = await SessionHelper.add({ data: sessionData })
    Sinon.stub(FetchCompanyDetailsService, 'go').returns(fetchResults)
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewExistingAccountService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          {
            id: fetchResults[0].id,
            value: fetchResults[0].id,
            text: fetchResults[0].name,
            checked: false
          },
          { divider: 'or' },
          {
            id: 'new',
            value: 'new',
            text: 'Setup a new account',
            checked: false
          }
        ],
        pageTitle: 'Does this account already exist?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})

function _companies() {
  return [
    {
      id: generateUUID(),
      name: 'Company Name Ltd'
    }
  ]
}
