// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchExistingCompaniesService from '../../../../app/services/billing-accounts/setup/fetch-existing-companies.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewExistingAccountService from '../../../../app/services/billing-accounts/setup/view-existing-account.service.js'

describe('Billing Accounts - Setup - View Existing Account service', () => {
  const fetchResults = _companies()

  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      searchInput: 'Company Name'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(FetchExistingCompaniesService, 'default').mockReturnValue(fetchResults)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewExistingAccountService(session.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          {
            id: fetchResults[0].id,
            value: fetchResults[0].id,
            text: fetchResults[0].name,
            checked: false
          },
          { divider: 'or' },
          {
            id: 'new',
            value: 'new',
            text: 'Setup a new account',
            checked: false
          }
        ],
        pageTitle: 'Does this account already exist?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
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
