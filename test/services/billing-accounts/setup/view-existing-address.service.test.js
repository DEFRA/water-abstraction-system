// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchCompanyAddressesService from '../../../../app/services/billing-accounts/setup/fetch-company-addresses.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewExistingAddressService from '../../../../app/services/billing-accounts/setup/view-existing-address.service.js'

describe('Billing Accounts - Setup - View Existing Address Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companyAddresses = {
    company: billingAccount.company,
    addresses: [billingAccount.billingAccountAddresses[0].address]
  }
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(FetchCompanyAddressesService, 'default').mockReturnValue(companyAddresses)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the user has come from the account page', () => {
      beforeEach(() => {
        sessionData = {
          accountSelected: billingAccount.company.id,
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view', async () => {
        const result = await ViewExistingAddressService(session.id)

        expect(result).toEqual({
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

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view', async () => {
        const result = await ViewExistingAddressService(session.id)

        expect(result).toEqual({
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

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view', async () => {
        const result = await ViewExistingAddressService(session.id)

        expect(result).toEqual({
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
