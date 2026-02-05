'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')

// Thing under test
const SubmitExistingAccountService = require('../../../../app/services/billing-accounts/setup/submit-existing-account.service.js')

describe('Billing Accounts - Setup - Submit Existing Account service', () => {
  const conpanies = _companies()
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {}
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
    Sinon.restore()
  })

  describe('when the user picks an existing account', () => {
    beforeEach(async () => {
      payload = {
        existingAccount: conpanies[0].id
      }
    })

    it('saves the submitted value and adds the "addressJourney" object', async () => {
      await SubmitExistingAccountService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressJourney: {
            address: {},
            backLink: { href: `/system/billing-accounts/setup/${session.id}/existing-account`, text: 'Back' },
            pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
            redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
          },
          existingAccount: payload.existingAccount
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAccountService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/address/${session.id}/postcode`
      })
    })
  })

  describe('when the user picks a new account', () => {
    beforeEach(async () => {
      payload = {
        existingAccount: 'new'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAccountService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          existingAccount: 'new'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAccountService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/account-type`
      })
    })
  })

  describe('when the user picks a new account after having already picked an existing account', () => {
    beforeEach(async () => {
      payload = {
        existingAccount: 'new'
      }
      sessionData = {
        addressJourney: {
          address: {},
          backLink: { href: `/system/billing-accounts/setup/${session.id}/existing-account`, text: 'Back' },
          pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        },
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    afterEach(async () => {
      await session.$query().delete()
      Sinon.restore()
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAccountService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          existingAccount: 'new'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAccountService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/account-type`
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
      Sinon.stub(FetchCompaniesService, 'go').returns(conpanies)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitExistingAccountService.go(session.id, payload)

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#existingAccount',
            text: `Select does this account already exist?`
          }
        ],
        existingAccount: { text: `Select does this account already exist?` }
      })
    })
  })
})

function _companies() {
  return [
    {
      exact: true,
      id: generateUUID(),
      name: 'Company Name Ltd'
    }
  ]
}
