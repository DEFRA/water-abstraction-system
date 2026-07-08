'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewContactNameService = require('../../../../app/services/billing-accounts/setup/view-contact-name.service.js')

describe('Billing Accounts - Setup - Contact Name Service', () => {
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
      const result = await ViewContactNameService(session.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/contact`,
          text: 'Back'
        },
        contactName: session.contactName ?? null,
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
