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
const FetchExistingCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-existing-companies.service.js')

// Thing under test
const SubmitExistingAccountService = require('../../../../app/services/billing-accounts/setup/submit-existing-account.service.js')

describe('Billing Accounts - Setup - Submit Existing Account service', () => {
  const companies = _companies()

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
        existingAccount: companies[0].id
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAccountService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          existingAccount: payload.existingAccount
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAccountService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          existingAccount: payload.existingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAccountService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            existingAccount: payload.existingAccount
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAccountService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          checkPageVisited: true,
          existingAccount: payload.existingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAccountService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            checkPageVisited: true,
            existingAccount: payload.existingAccount
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAccountService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user had previously completed the "new" journey', () => {
      beforeEach(async () => {
        sessionData = _newAccountSessionData(session)

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value and deletes the previously saved data', async () => {
        await SubmitExistingAccountService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            ..._newAccountExpectedValues(),
            existingAccount: companies[0].id
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAccountService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
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

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          existingAccount: payload.existingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAccountService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            existingAccount: payload.existingAccount
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

    describe('and the user had previously completed the existing account journey', () => {
      beforeEach(async () => {
        sessionData = _existingAccountSessionData(session)

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAccountService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            ..._commonExpectedValues(),
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
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
      Sinon.stub(FetchExistingCompaniesService, 'go').returns(companies)
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

function _commonExpectedValues() {
  return {
    accountSelected: 'another',
    addressSelected: null,
    addressJourney: null,
    checkPageVisited: false,
    contactName: null,
    contactSelected: null,
    fao: null,
    searchInput: 'Customer Name'
  }
}

function _newAccountExpectedValues() {
  return {
    ..._commonExpectedValues(),
    accountType: null,
    addressSelected: null,
    companiesHouseId: null,
    companySearch: null,
    existingAccount: null,
    searchIndividualInput: null
  }
}

function _newAccountSessionData(session) {
  return {
    ..._commonSessionData(session),
    accountType: 'company',
    companiesHouseId: '12345678',
    companySearch: 'Company Name',
    existingAccount: 'new',
    searchIndividualInput: 'Contact Name'
  }
}

function _existingAccountSessionData(session) {
  return {
    ..._commonSessionData(session),
    existingAccount: 'customer'
  }
}

function _commonSessionData(session) {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  return {
    accountSelected: 'another',
    addressSelected: 'new',
    addressJourney: {
      address: {},
      backLink: { href: `/system/billing-accounts/setup/${session.id}/existing-account`, text: 'Back' },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
    },
    billingAccount,
    contactName: 'Contact Name',
    contactSelected: 'new',
    fao: 'yes',
    searchInput: 'Customer Name'
  }
}
