// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as FetchBillRunService from '../../../src/services/bill-runs/fetch-bill-run.service.js'

// Thing under test
import ViewBillRunService from '../../../src/services/bill-runs/view-bill-run.service.js'

describe('View Bill Run service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  let fetchBillRunResult

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a bill with a matching ID exists', () => {
    describe('and it has a status of "empty"', () => {
      beforeEach(() => {
        fetchBillRunResult = _singleGroupBillRun()
        fetchBillRunResult.billRun.status = 'empty'

        vi.spyOn(FetchBillRunService, 'default').mockResolvedValue(fetchBillRunResult)
      })

      it('will fetch the data and format it for use in the empty bill run page', async () => {
        const result = await ViewBillRunService(testId)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          backLink: '/system/bill-runs',
          billRunNumber: 10003,
          billRunStatus: 'empty',
          billRunType: 'Annual',
          buttonLink: '/system/bill-runs/2c80bd22-a005-4cf4-a2a2-73812a9861de/cancel',
          chargeScheme: 'Current',
          dateCreated: '7 March 2023',
          financialYear: '2022 to 2023',
          pageTitle: 'South West annual',
          region: 'South West',
          view: 'bill-runs/empty.njk'
        })
      })
    })

    describe('and it has a status of "errored"', () => {
      beforeEach(() => {
        fetchBillRunResult = _singleGroupBillRun()
        fetchBillRunResult.billRun.status = 'error'

        vi.spyOn(FetchBillRunService, 'default').mockResolvedValue(fetchBillRunResult)
      })

      it('will fetch the data and format it for use in the errored bill run page', async () => {
        const result = await ViewBillRunService(testId)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          backLink: '/system/bill-runs',
          billRunNumber: 10003,
          billRunStatus: 'error',
          billRunType: 'Annual',
          buttonLink: '/system/bill-runs/2c80bd22-a005-4cf4-a2a2-73812a9861de/cancel',
          chargeScheme: 'Current',
          dateCreated: '7 March 2023',
          errorMessage: 'No error code was assigned. We have no further information at this time.',
          financialYear: '2022 to 2023',
          pageTitle: 'South West annual',
          region: 'South West',
          view: 'bill-runs/errored.njk'
        })
      })
    })

    describe('and it has a status of "sent"', () => {
      describe('and it is linked to bills from both groups (water companies and other abstractors)', () => {
        beforeEach(() => {
          fetchBillRunResult = _multipleGroupBillRun()
          vi.spyOn(FetchBillRunService, 'default').mockResolvedValue(fetchBillRunResult)
        })

        it('will fetch the data and format it for use in the view bill run page', async () => {
          const result = await ViewBillRunService(testId)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            billGroups: [
              {
                bills: [
                  {
                    accountNumber: 'E22288888A',
                    billingContact: 'Acme Water Services Ltd',
                    financialYear: 2023,
                    id: '64924759-8142-4a08-9d1e-1e902cd9d316',
                    licences: ['17/53/001/A/101', '17/53/002/B/205', '17/53/002/C/308'],
                    licencesCount: 3,
                    total: '£213,178.00'
                  }
                ],
                caption: '1 water company',
                type: 'water-companies'
              },
              {
                bills: [
                  {
                    accountNumber: 'E11101999A',
                    billingContact: 'Geordie Leforge',
                    financialYear: 2023,
                    id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
                    licences: ['17/53/001/G/782'],
                    licencesCount: 1,
                    total: '£97.00'
                  }
                ],
                caption: '1 other abstractor',
                type: 'other-abstractors'
              }
            ],
            billGroupsCount: 2,
            billRunNumber: 10003,
            billRunStatus: 'sent',
            billRunTotal: '£213,275.00',
            billRunType: 'Annual',
            billsCount: '2 Annual bills',
            chargeScheme: 'Current',
            creditsCount: '0 credit notes',
            creditsTotal: '£0.00',
            dateCreated: '7 March 2023',
            debitsCount: '2 invoices',
            debitsTotal: '£213,275.00',
            displayCreditDebitTotals: false,
            financialYear: '2022 to 2023',
            links: {
              backLink: '/system/bill-runs',
              cancelBillRunLink: '/system/bill-runs/2c80bd22-a005-4cf4-a2a2-73812a9861de/cancel',
              downloadBillRunLink: '/billing/batch/2c80bd22-a005-4cf4-a2a2-73812a9861de/transactions-csv',
              sendBillRunLink: `/system/bill-runs/2c80bd22-a005-4cf4-a2a2-73812a9861de/send`
            },
            pageTitle: 'South West annual',
            region: 'South West',
            transactionFile: 'nalei90002t',
            view: 'bill-runs/view.njk'
          })
        })
      })

      describe('and it is linked to bills from a single group (water companies or other abstractors)', () => {
        beforeEach(() => {
          fetchBillRunResult = _singleGroupBillRun()
          vi.spyOn(FetchBillRunService, 'default').mockResolvedValue(fetchBillRunResult)
        })

        it('will fetch the data and format it for use in the view bill run page', async () => {
          const result = await ViewBillRunService(testId)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            billGroups: [
              {
                bills: [
                  {
                    accountNumber: 'E11101999A',
                    billingContact: 'Geordie Leforge',
                    financialYear: 2023,
                    id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
                    licences: ['17/53/001/G/782'],
                    licencesCount: 1,
                    total: '£97.00'
                  }
                ],
                caption: '1 other abstractor',
                type: 'other-abstractors'
              }
            ],
            billGroupsCount: 1,
            billRunNumber: 10003,
            billRunStatus: 'sent',
            billRunTotal: '£97.00',
            billRunType: 'Annual',
            billsCount: '1 Annual bill',
            chargeScheme: 'Current',
            creditsCount: '0 credit notes',
            creditsTotal: '£0.00',
            dateCreated: '7 March 2023',
            debitsCount: '1 invoice',
            debitsTotal: '£97.00',
            displayCreditDebitTotals: false,
            financialYear: '2022 to 2023',
            links: {
              backLink: '/system/bill-runs',
              cancelBillRunLink: '/system/bill-runs/2c80bd22-a005-4cf4-a2a2-73812a9861de/cancel',
              downloadBillRunLink: '/billing/batch/2c80bd22-a005-4cf4-a2a2-73812a9861de/transactions-csv',
              sendBillRunLink: `/system/bill-runs/2c80bd22-a005-4cf4-a2a2-73812a9861de/send`
            },
            pageTitle: 'South West annual',
            region: 'South West',
            transactionFile: 'nalei90002t',
            view: 'bill-runs/view.njk'
          })
        })
      })
    })
  })

  describe('when a bill run with a matching ID does not exist', () => {
    beforeEach(() => {
      vi.spyOn(FetchBillRunService, 'default').mockResolvedValue({
        billRun: undefined,
        billSummaries: []
      })
    })

    it('throws an exception', async () => {
      await expect(ViewBillRunService('testId')).rejects.toThrow()
    })
  })
})

function _multipleGroupBillRun() {
  const billSummaries = _billSummariesData()

  return {
    billRun: {
      batchType: 'annual',
      billRunNumber: 10003,
      createdAt: new Date('2023-03-07'),
      creditNoteCount: 0,
      creditNoteValue: 0,
      errorCode: null,
      id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
      invoiceCount: 2,
      invoiceValue: 21327500,
      netTotal: 21327500,
      region: {
        displayName: 'South West',
        id: 'adca5dd3-114d-4477-8cdd-684081429f4b'
      },
      scheme: 'sroc',
      source: 'wrls',
      status: 'sent',
      summer: false,
      toFinancialYearEnding: 2023,
      transactionFileReference: 'nalei90002t'
    },
    billSummaries
  }
}

function _singleGroupBillRun() {
  const billSummaries = _billSummariesData()

  delete billSummaries[1]

  return {
    billRun: {
      batchType: 'annual',
      billRunNumber: 10003,
      createdAt: new Date('2023-03-07'),
      creditNoteCount: 0,
      creditNoteValue: 0,
      errorCode: null,
      id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
      invoiceCount: 1,
      invoiceValue: 9700,
      netTotal: 9700,
      region: {
        displayName: 'South West',
        id: 'adca5dd3-114d-4477-8cdd-684081429f4b'
      },
      scheme: 'sroc',
      source: 'wrls',
      status: 'sent',
      summer: false,
      toFinancialYearEnding: 2023,
      transactionFileReference: 'nalei90002t'
    },
    billSummaries
  }
}

function _billSummariesData() {
  return [
    {
      accountNumber: 'E11101999A',
      agentName: 'Geordie Leforge',
      allLicences: '17/53/001/G/782',
      billingAccountId: 'e8bd9fe1-47eb-42f2-a507-786bccd35aee',
      companyName: 'H M Scotty & Daughter',
      financialYearEnding: 2023,
      id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
      netAmount: 9700,
      waterCompany: false
    },
    {
      accountNumber: 'E22288888A',
      agentName: null,
      allLicences: '17/53/001/A/101,17/53/002/B/205,17/53/002/C/308',
      billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
      companyName: 'Acme Water Services Ltd',
      financialYearEnding: 2023,
      id: '64924759-8142-4a08-9d1e-1e902cd9d316',
      netAmount: 21317800,
      waterCompany: true
    }
  ]
}
