'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewAccountService = require('../../../../app/services/billing-accounts/setup/view-account.service.js')

describe('Billing Accounts - Setup - View Account Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAccountService.go(session.id)

      expect(result).to.equal({
        accountSelected: null,
        backLink: {
          href: `/system/billing-accounts/${session.billingAccount.id}`,
          text: 'Back'
        },
        companyId: session.billingAccount.company.id,
        companyName: session.billingAccount.company.name,
        pageTitle: 'Who should the bills go to?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchInput: null
      })
    })
  })
})
