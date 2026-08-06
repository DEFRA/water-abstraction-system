// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import * as FetchExistingAddressDal from '../../../../src/dal/billing-accounts/fetch-existing-address.dal.js'
import * as FetchImpactedLicences from '../../../../src/dal/billing-accounts/fetch-impacted-licences.dal.js'

// Thing under test
import ViewCheckService from '../../../../src/services/billing-accounts/setup/view-check.service.js'

describe('Billing Accounts - Setup - View Check Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount,
      fao: 'no'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchExistingAddressDal, 'default').mockResolvedValue()
    vi.spyOn(FetchImpactedLicences, 'default').mockResolvedValue([])
    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckService(session.id)

      expect(result).toEqual({
        accountSelected: 'Ferns Surfacing Limited',
        accountType: '',
        address: [],
        addressSelected: ['New'],
        companiesHouseName: '',
        companySearch: '',
        contactSelected: null,
        contactName: '',
        existingAccount: '',
        fao: 'no',
        links: {
          accountSelected: `/system/billing-accounts/setup/${session.id}/account`,
          accountType: `/system/billing-accounts/setup/${session.id}/account-type`,
          address: `/system/address/${session.id}/postcode`,
          addressSelected: `/system/billing-accounts/setup/${session.id}/existing-address`,
          companiesHouseName: `/system/billing-accounts/setup/${session.id}/select-company`,
          companySearch: `/system/billing-accounts/setup/${session.id}/company-search`,
          contactSelected: `/system/billing-accounts/setup/${session.id}/contact`,
          contactName: `/system/billing-accounts/setup/${session.id}/contact-name`,
          existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`,
          fao: `/system/billing-accounts/setup/${session.id}/fao`
        },
        pageTitle: 'Check billing account details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        impactedLicences: [],
        individualName: '',
        searchInput: ''
      })
    })
  })
})
