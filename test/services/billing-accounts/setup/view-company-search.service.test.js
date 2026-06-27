'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCompanySearchService = require('../../../../app/services/billing-accounts/setup/view-company-search.service.js')

describe('Billing Accounts - Setup - View Company Search Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCompanySearchService.go(session.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account-type`,
          text: 'Back'
        },
        companySearch: null,
        pageTitle: 'Enter the company details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
