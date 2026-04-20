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
const FetchCompanyAddressesService = require('../../../../app/services/billing-accounts/setup/fetch-company-addresses.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewExistingAddressService = require('../../../../app/services/billing-accounts/setup/view-existing-address.service.js')

describe('Billing Accounts - Setup - View Existing Address Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companyAddresses = {
    company: billingAccount.company,
    addresses: [billingAccount.billingAccountAddresses[0].address]
  }

  let fetchSessionStub
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    Sinon.stub(FetchCompanyAddressesService, 'go').returns(companyAddresses)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user has come from the account page', () => {
      beforeEach(() => {
        sessionData = {
          accountSelected: billingAccount.company.id,
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
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
      beforeEach(() => {
        sessionData = {
          accountSelected: 'another',
          billingAccount,
          existingAccount: billingAccount.company.id
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
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

    describe('and the user has come from the account type page', () => {
      beforeEach(() => {
        sessionData = {
          accountSelected: 'another',
          accountType: 'individual',
          billingAccount,
          existingAccount: 'new'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('returns page data for the view', async () => {
        const result = await ViewExistingAddressService.go(session.id)

        expect(result).to.equal({
          backLink: {
            href: `/system/billing-accounts/setup/${session.id}/account-type`,
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
