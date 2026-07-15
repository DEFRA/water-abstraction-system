// Test helpers
import BillingAccountHelper from '../../../support/helpers/billing-account.helper.js'

// Thing under test
import FetchBillingAccountsService from '../../../../app/services/bill-runs/supplementary/fetch-billing-accounts.service.js'

describe('Fetch Billing Accounts service', () => {
  describe('when the service is called with an array of charge version', () => {
    let expectedResult
    let billingAccounts

    beforeEach(async () => {
      // We create three billing accounts but we will only be fetching the first two
      billingAccounts = await Promise.all([
        BillingAccountHelper.add(),
        BillingAccountHelper.add(),
        BillingAccountHelper.add()
      ])

      expectedResult = [
        {
          id: billingAccounts[0].id,
          accountNumber: billingAccounts[0].accountNumber
        },
        {
          id: billingAccounts[1].id,
          accountNumber: billingAccounts[1].accountNumber
        }
      ]
    })

    it('fetches the billing accounts that the charge versions link to', async () => {
      const result = await FetchBillingAccountsService([
        { billingAccountId: billingAccounts[0].id },
        { billingAccountId: billingAccounts[1].id }
      ])

      expect(result).toHaveLength(2)
      expect(result).toEqual(
        expect.arrayContaining(
          expectedResult.map((item) => {
            return expect.objectContaining(item)
          })
        )
      )
    })
  })
})
