// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as FetchBillLicenceSummaryDal from '../../../src/dal/bill-licences/fetch-bill-licence-summary.dal.js'

// Thing under test
import RemoveBillLicenceService from '../../../src/services/bill-licences/remove-bill-licence.service.js'

describe('Bill Licences - Remove Bill Licence service', () => {
  const testId = 'a4fbaa27-a91c-4328-a1b8-774ade11027b'

  beforeEach(() => {
    vi.spyOn(FetchBillLicenceSummaryDal, 'default').mockResolvedValue(_billLicenceSummary())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RemoveBillLicenceService(testId)

      expect(result).toEqual({
        accountName: 'Example Trading Ltd',
        accountNumber: 'T65757520A',
        activeNavBar: 'bill-runs',
        billLicenceId: testId,
        billRunNumber: 10010,
        billRunStatus: 'ready',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '1 November 2023',
        financialYear: '2023 to 2024',
        licenceRef: 'WA/055/0017/013',
        pageTitle: "You're about to remove WA/055/0017/013 from the bill run",
        region: 'Stormlands',
        transactionsTotal: '£288.37'
      })
    })
  })
})

function _billLicenceSummary() {
  return {
    bill: {
      accountNumber: 'T65757520A',
      billingAccount: {
        accountNumber: 'T65757520A',
        billingAccountAddresses: [
          {
            company: null,
            contact: {
              contactType: 'person',
              dataSource: 'wrls',
              department: null,
              firstName: 'Amara',
              id: '95ba53be-543f-415b-90b1-08f58f63ff74',
              initials: null,
              lastName: 'Gupta',
              middleInitials: null,
              salutation: null,
              suffix: null
            },
            id: '1d440029-745a-47ec-a43e-9f4a36014126'
          }
        ],
        company: {
          id: '3b60ddd0-654f-4012-a349-000aab3e49c3',
          name: 'Example Trading Ltd',
          type: 'organisation'
        },
        id: 'e2b35a4a-7368-425f-9990-faa23efc0a25'
      },
      billRun: {
        batchType: 'supplementary',
        billRunNumber: 10010,
        createdAt: new Date('2023-11-01'),
        id: '0e61c36f-f22f-4534-8247-b73a97f551b5',
        region: {
          displayName: 'Stormlands',
          id: '4ad8ce03-48a8-447e-bce2-3c317d0aeaf6'
        },
        scheme: 'sroc',
        source: 'wrls',
        status: 'ready',
        toFinancialYearEnding: 2024
      },
      id: '5a5b313b-e707-490a-a693-799339941e4f'
    },
    id: 'a4fbaa27-a91c-4328-a1b8-774ade11027b',
    licenceId: '2eaa831d-7bd6-4b0a-aaf1-3aacafec6bf2',
    licenceRef: 'WA/055/0017/013',
    transactions: [
      {
        credit: false,
        id: '5858e36f-5a8e-4f5c-84b3-cbca26624d67',
        netAmount: 29837
      },
      {
        credit: true,
        id: '5858e36f-5a8e-4f5c-84b3-cbca26624d67',
        netAmount: -1000
      },
      {
        credit: false,
        id: '14d6d530-7f07-4e4b-ac17-b8ade9f5b21a',
        netAmount: 0
      },
      {
        credit: false,
        id: '23f43d51-8880-4e30-89da-40231cb8dea2',
        netAmount: 0
      }
    ]
  }
}
