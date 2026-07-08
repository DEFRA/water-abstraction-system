// Test framework dependencies

// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'

// Things we need to stub
import * as FetchViewBillingAccountService from '../../../../app/services/billing-accounts/fetch-view-billing-account.service.js'

// Thing under test
import InitiateSessionService from '../../../../app/services/billing-accounts/setup/initiate-session.service.js'

describe('Billing Accounts - Setup - Initiate Session service', () => {
  const billingAccountData = BillingAccountsFixture.billingAccount()
  const billingAccount = billingAccountData.billingAccount

  describe('when called', () => {
    beforeAll(async () => {
      vi.spyOn(FetchViewBillingAccountService, 'default').mockReturnValue(billingAccountData)
    })

    it('creates a new session record containing details of the billing account', async () => {
      const result = await InitiateSessionService(billingAccount.id)

      expect(result.data).toEqual({
        billingAccount
      })
    })
  })
})
