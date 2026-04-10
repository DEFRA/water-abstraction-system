'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewAccountTypeService = require('../../../../app/services/billing-accounts/setup/view-account-type.service.js')

describe('Billing Accounts - Setup - Account Type Service', () => {
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

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAccountTypeService.go(session.id)

      expect(result).to.equal({
        accountType: null,
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
