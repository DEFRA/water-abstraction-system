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

// Things we need to stub
const FetchCompanyAddressesService = require('../../../../app/services/billing-accounts/setup/fetch-company-addresses.service.js')

// Thing under test
const ViewExistingAddressService = require('../../../../app/services/billing-accounts/setup/view-existing-address.service.js')

describe('Billing Accounts - Setup - View Existing Address Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companyAddresses = {
    company: billingAccount.company,
    addresses: [billingAccount.billingAccountAddresses[0].address]
  }

  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })

    Sinon.stub(FetchCompanyAddressesService, 'go').returns(companyAddresses)
  })

  afterEach(async () => {
    await session.$query().delete()
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user has come from the account page', () => {
      beforeEach(async () => {
        sessionData = {
          accountSelected: billingAccount.company.id,
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns page data for the view', async () => {
        const result = await ViewExistingAddressService.go(session.id)

        expect(result).to.equal({
          backLink: {
            href: `/system/billing-accounts/setup/${session.id}/account`,
            text: 'Back'
          },
          items: [
            {
              id: companyAddresses.addresses[0].id,
              value: companyAddresses.addresses[0].id,
              text: 'Tutsham Farm, West Farleigh, Maidstone, Kent, ME15 0NE',
              checked: false
            },
            { divider: 'or' },
            {
              id: 'new',
              value: 'new',
              text: 'Setup a new address',
              checked: false
            }
          ],
          pageTitle: `Select an existing address for ${session.billingAccount.company.name}`,
          pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
        })
      })
    })

    describe('and the user has come from the existing account page', () => {
      beforeEach(async () => {
        sessionData = {
          accountSelected: 'another',
          billingAccount,
          existingAccount: billingAccount.company.id
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns page data for the view', async () => {
        const result = await ViewExistingAddressService.go(session.id)

        expect(result).to.equal({
          backLink: {
            href: `/system/billing-accounts/setup/${session.id}/existing-account`,
            text: 'Back'
          },
          items: [
            {
              id: companyAddresses.addresses[0].id,
              value: companyAddresses.addresses[0].id,
              text: 'Tutsham Farm, West Farleigh, Maidstone, Kent, ME15 0NE',
              checked: false
            },
            { divider: 'or' },
            {
              id: 'new',
              value: 'new',
              text: 'Setup a new address',
              checked: false
            }
          ],
          pageTitle: `Select an existing address for ${session.billingAccount.company.name}`,
          pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
        })
      })
    })
  })
})
