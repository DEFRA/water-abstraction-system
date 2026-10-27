// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import {
  generateAccountNumber,
  generateLicenceRef,
  generateRandomInteger,
  generateUUID
} from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as FetchBillLicenceSummaryDal from '../../../src/dal/bill-licences/fetch-bill-licence-summary.dal.js'

// Thing under test
import RemoveBillLicenceService from '../../../src/services/bill-licences/remove-bill-licence.service.js'

describe('Bill Licences - Remove Bill Licence service', () => {
  let billLicence

  beforeEach(() => {
    billLicence = _billLicenceSummary()

    vi.spyOn(FetchBillLicenceSummaryDal, 'default').mockResolvedValue(billLicence)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RemoveBillLicenceService(billLicence.id)

      expect(result).toEqual({
        accountName: 'Example Trading Ltd',
        accountNumber: billLicence.bill.accountNumber,
        activeNavBar: 'bill-runs',
        billLicenceId: billLicence.id,
        billRunNumber: billLicence.bill.billRun.billRunNumber,
        billRunStatus: 'ready',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '1 November 2023',
        financialYear: '2023 to 2024',
        licenceRef: billLicence.licenceRef,
        pageTitle: `You're about to remove ${billLicence.licenceRef} from the bill run`,
        region: billLicence.bill.billRun.region.displayName,
        transactionsTotal: '£288.37'
      })
    })
  })
})

function _billLicenceSummary() {
  const accountNumber = generateAccountNumber()
  const { displayName, id: regionId } = RegionHelper.select()

  return {
    bill: {
      accountNumber,
      billingAccount: {
        accountNumber,
        billingAccountAddresses: [
          {
            company: null,
            contact: {
              contactType: 'person',
              dataSource: 'wrls',
              department: null,
              firstName: 'Amara',
              id: generateUUID(),
              initials: null,
              lastName: 'Gupta',
              middleInitials: null,
              salutation: null,
              suffix: null
            },
            id: generateUUID()
          }
        ],
        company: {
          id: generateUUID(),
          name: 'Example Trading Ltd',
          type: 'organisation'
        },
        id: generateUUID()
      },
      billRun: {
        batchType: 'supplementary',
        billRunNumber: generateRandomInteger(10000, 99999),
        createdAt: new Date('2023-11-01'),
        id: generateUUID(),
        region: {
          displayName,
          id: regionId
        },
        scheme: 'sroc',
        source: 'wrls',
        status: 'ready',
        toFinancialYearEnding: 2024
      },
      id: generateUUID()
    },
    id: generateUUID(),
    licenceId: generateUUID(),
    licenceRef: generateLicenceRef(),
    transactions: [
      {
        credit: false,
        id: generateUUID(),
        netAmount: 29837
      },
      {
        credit: true,
        id: generateUUID(),
        netAmount: -1000
      },
      {
        credit: false,
        id: generateUUID(),
        netAmount: 0
      },
      {
        credit: false,
        id: generateUUID(),
        netAmount: 0
      }
    ]
  }
}
