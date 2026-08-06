// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import * as FetchCompaniesService from '../../../../src/services/billing-accounts/setup/fetch-companies.service.js'

// Test helpers
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'

// Thing under test
import ViewSelectCompanyService from '../../../../src/services/billing-accounts/setup/view-select-company.service.js'

describe('Billing Accounts - Setup - View Select Company Service', () => {
  const companies = [
    {
      address: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      number: '12345678',
      title: 'ENVIRONMENT AGENCY'
    }
  ]

  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(FetchCompaniesService, 'default').mockReturnValue(companies)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewSelectCompanyService(session.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/company-search`,
          text: 'Back'
        },
        companies: [
          {
            checked: false,
            id: companies[0].number,
            hint: { text: companies[0].address },
            text: companies[0].title,
            value: companies[0].number
          }
        ],
        companiesHouseNumber: null,
        pageTitle: 'Select the registered company details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
