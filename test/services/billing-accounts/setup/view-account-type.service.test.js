// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ViewAccountTypeService from '../../../../src/services/billing-accounts/setup/view-account-type.service.js'

describe('Billing Accounts - Setup - Account Type Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAccountTypeService(session.id)

      expect(result).toEqual({
        accountType: null,
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/existing-account`,
          text: 'Back'
        },
        pageTitle: 'Select the account type',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        individualName: null
      })
    })
  })
})
