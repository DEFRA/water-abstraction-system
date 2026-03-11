'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitAccountTypeService = require('../../../../app/services/billing-accounts/setup/submit-account-type.service.js')

describe('Billing Accounts - Setup - Account Type Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called with "company" selected', () => {
    beforeEach(async () => {
      payload = { accountType: 'company' }
    })

    it('saves the submitted value', async () => {
      await SubmitAccountTypeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          accountType: 'company',
          searchIndividualInput: null
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitAccountTypeService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/company-search`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          accountType: 'company',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            accountType: 'company',
            searchIndividualInput: null
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/company-search`
        })
      })
    })

    describe('and the user has returned to the page after visiting the check page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          accountType: 'company',
          checkPageVisited: true,
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            accountType: 'company',
            checkPageVisited: true,
            searchIndividualInput: null
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user had previously completed the "individual" journey', () => {
      beforeEach(async () => {
        sessionData = _individualSessionData(session)

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            ..._commonExpectedValues(),
            accountType: 'company',
            searchIndividualInput: null
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/company-search`
        })
      })
    })
  })

  describe('when called with "individual" selected and a search term entered', () => {
    beforeEach(async () => {
      payload = { accountType: 'individual', searchIndividualInput: 'John Doe' }
    })

    it('saves the submitted value', async () => {
      await SubmitAccountTypeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          accountType: 'individual',
          searchIndividualInput: 'John Doe'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitAccountTypeService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          accountType: 'individual',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          searchIndividualInput: 'John Doe'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            accountType: 'individual',
            searchIndividualInput: 'John Doe'
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          accountType: 'individual',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          checkPageVisited: true,
          searchIndividualInput: 'John Doe'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            accountType: 'individual',
            checkPageVisited: true,
            searchIndividualInput: 'John Doe'
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user had previously completed the "company" journey', () => {
      beforeEach(async () => {
        sessionData = _companySessionData(session)

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            ..._commonExpectedValues(),
            accountType: 'individual',
            companiesHouseNumber: null,
            companySearch: null,
            searchIndividualInput: 'John Doe'
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })

    describe('and the user has returned to the page, chosen "individual" but changed the search term', () => {
      beforeEach(async () => {
        payload = { accountType: 'individual', searchIndividualInput: 'Jane Doe' }
        sessionData = {
          ..._commonSessionData(session),
          accountType: 'individual',
          searchIndividualInput: 'John Doe'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            ..._commonExpectedValues(),
            accountType: 'individual',
            companiesHouseNumber: null,
            companySearch: null,
            searchIndividualInput: 'Jane Doe'
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#accountType',
              text: 'Select the account type'
            }
          ],
          accountType: { text: 'Select the account type' }
        })
      })
    })

    describe('because the user selected "individual" but did not enter a search input', () => {
      beforeEach(() => {
        payload = {
          accountType: 'individual'
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#searchIndividualInput',
              text: 'Enter the full name of the individual.'
            }
          ],
          searchIndividualInput: { text: 'Enter the full name of the individual.' }
        })
      })
    })
  })
})

function _commonExpectedValues() {
  return {
    accountSelected: 'another',
    addressJourney: null,
    addressSelected: null,
    checkPageVisited: false,
    contactName: null,
    contactSelected: null,
    existingAccount: 'new',
    fao: null,
    searchInput: 'Existing Customer Name'
  }
}

function _commonSessionData(session) {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  return {
    accountSelected: 'another',
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/billing-accounts/setup/${session.id}/existing-address`,
        text: 'Back'
      },
      pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
    },
    addressSelected: 'new',
    billingAccount,
    contactName: 'Contact Name',
    contactSelected: 'new',
    existingAccount: 'new',
    fao: 'yes',
    searchInput: 'Existing Customer Name'
  }
}

function _companySessionData(session) {
  return {
    ..._commonSessionData(session),
    accountType: 'company',
    companiesHouseNumber: '12345678',
    companySearch: 'Company Name'
  }
}

function _individualSessionData(session) {
  return {
    ..._commonSessionData(session),
    accountType: 'individual',
    searchIndividualInput: 'John Doe'
  }
}
