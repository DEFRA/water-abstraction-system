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

    describe('and the user had previously completed the "individual" journey', () => {
      beforeEach(async () => {
        sessionData = {
          accountSelected: 'another',
          accountType: 'individual',
          addressJourney: {
            address: {},
            backLink: {
              href: `/system/billing-accounts/setup/${session.id}/existing-address`,
              text: 'Back'
            },
            pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
            redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
          },
          addressSelected: 'new',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          contactName: 'Contact Name',
          contactSelected: 'new',
          existingAddress: 'new',
          existingAccount: 'new',
          fao: 'yes',
          searchIndividualInput: 'Customer Name',
          searchInput: 'Existing Customer Name'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            accountSelected: 'another',
            accountType: 'company',
            addressJourney: null,
            addressSelected: null,
            contactName: null,
            contactSelected: null,
            existingAccount: 'new',
            existingAddress: null,
            fao: null,
            searchIndividualInput: null,
            searchInput: 'Existing Customer Name'
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

    describe('and the user had previously completed the "company" journey', () => {
      beforeEach(async () => {
        sessionData = {
          accountSelected: 'another',
          accountType: 'company',
          addressJourney: {
            address: {},
            backLink: {
              href: `/system/billing-accounts/setup/${session.id}/existing-address`,
              text: 'Back'
            },
            pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
            redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
          },
          addressSelected: 'new',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          contactName: 'Contact Name',
          contactSelected: 'new',
          companiesHouseId: '12345678',
          companySearch: 'Company Name',
          existingAddress: 'new',
          existingAccount: 'new',
          fao: 'yes',
          searchInput: 'Existing Customer Name'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            accountSelected: 'another',
            accountType: 'individual',
            addressJourney: null,
            addressSelected: null,
            contactName: null,
            contactSelected: null,
            companiesHouseId: null,
            companySearch: null,
            existingAccount: 'new',
            existingAddress: null,
            fao: null,
            searchIndividualInput: 'John Doe',
            searchInput: 'Existing Customer Name'
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
