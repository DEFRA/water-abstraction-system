// Test framework dependencies

// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import FetchExistingAddressDal from '../../../../app/dal/billing-accounts/fetch-existing-address.dal.js'
import FetchImpactedLicences from '../../../../app/dal/billing-accounts/fetch-impacted-licences.dal.js'
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewCheckService from '../../../../app/services/billing-accounts/setup/view-check.service.js'

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

    vi.mock('../../../../app/dal/billing-accounts/fetch-existing-address.dal.js')
    FetchExistingAddressDal.mockResolvedValue()
    vi.mock('../../../../app/dal/billing-accounts/fetch-impacted-licences.dal.js')
    FetchImpactedLicences.mockResolvedValue([])
    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)
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
