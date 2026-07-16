// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillingAccountsFixture from '../../support/fixtures/billing-accounts.fixture.js'
import { generateUUID } from '../../support/generators.js'

// Things we need to stub
import * as FetchViewBillingAccountService from '../../../app/services/billing-accounts/fetch-view-billing-account.service.js'

// Thing under test
import ViewBillingAccountService from '../../../app/services/billing-accounts/view-billing-account.service.js'

describe('Billing Accounts - View Billing Account service', () => {
  let billingAccountData
  let chargeVersionId
  let companyId
  let licenceId

  beforeEach(() => {
    billingAccountData = BillingAccountsFixture.billingAccount()

    chargeVersionId = generateUUID()
    companyId = generateUUID()
    licenceId = generateUUID()

    vi.spyOn(FetchViewBillingAccountService, 'default').mockReturnValue(billingAccountData)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a billing account with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewBillingAccountService(
        billingAccountData.billingAccount.id,
        1,
        licenceId,
        chargeVersionId,
        companyId
      )

      expect(result).toEqual({
        address: [
          'Ferns Surfacing Limited',
          'Test Testingson',
          'Tutsham Farm',
          'West Farleigh',
          'Maidstone',
          'Kent',
          'ME15 0NE'
        ],
        backLink: {
          href: `/licences/${licenceId}/charge-information/${chargeVersionId}/view`,
          text: 'Go back to charge information'
        },
        billingAccountId: billingAccountData.billingAccount.id,
        bills: [
          {
            billId: billingAccountData.bills[0].id,
            billNumber: 'Zero value bill',
            billRunNumber: 607,
            billRunType: 'Annual',
            billTotal: '£103.84',
            dateCreated: '14 December 2023',
            financialYear: 2021
          }
        ],
        createdDate: '14 December 2023',
        customerFile: null,
        lastUpdated: null,
        pageTitle: 'Billing account for Ferns Surfacing Limited',
        pagination: { currentPageNumber: 1, numberOfPages: 1, showingMessage: 'Showing all 1 bills' },
        pageTitleCaption: `Billing account ${billingAccountData.billingAccount.accountNumber}`
      })
    })
  })
})
