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
const FAOService = require('../../../../app/services/billing-accounts/setup/view-fao.service.js')

describe('Billing Accounts - Setup - View FAO Service', () => {
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
      const result = await FAOService.go(session.id)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/existing-address`,
          text: 'Back'
        },
        fao: session.fao ?? null,
        pageTitle: 'Do you need to add an FAO?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
