'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchBillRunService = require('../../../app/services/bill-runs/fetch-bill-run.service.js')

// Thing under test
const ViewBillRunService = require('../../../app/services/bill-runs/view-bill-run.service.js')

describe('View Bill Run service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
  let fetchBillRunResult

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill with a matching ID exists', () => {
    describe('and it has a status of "empty"', () => {
      beforeEach(() => {
        fetchBillRunResult = _singleGroupBillRun()
        fetchBillRunResult.billRun.status = 'empty'

        Sinon.stub(FetchBillRunService, 'go').resolves(fetchBillRunResult)
      })

      it('will fetch the data and format it for use in the empty bill run page', async () => {
        const result = await ViewBillRunService.go(testId)

        expect(result).to.equal({
          activeNavBar: 'bill-runs',
          billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
          billRunNumber: 10003,
          billRunStatus: 'empty',
          billRunType: 'Annual',
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

        Sinon.stub(FetchBillRunService, 'go').resolves(fetchBillRunResult)
      })

      it('will fetch the data and format it for use in the errored bill run page', async () => {
        const result = await ViewBillRunService.go(testId)

        expect(result).to.equal({
          activeNavBar: 'bill-runs',
          billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
          billRunNumber: 10003,
          billRunStatus: 'error',
          billRunType: 'Annual',
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
          Sinon.stub(FetchBillRunService, 'go').resolves(fetchBillRunResult)
        })

        it('will fetch the data and format it for use in the view bill run page', async () => {
          const result = await ViewBillRunService.go(testId)

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            billsCount: '2 Annual bills',
            billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
            billRunNumber: 10003,
            billRunStatus: 'sent',
            billRunTotal: '£213,275.00',
            billRunType: 'Annual',
            chargeScheme: 'Current',
            creditsCount: '0 credit notes',
            creditsTotal: '£0.00',
            dateCreated: '7 March 2023',
            debitsCount: '2 invoices',
            debitsTotal: '£213,275.00',
            displayCreditDebitTotals: false,
            financialYear: '2022 to 2023',
            pageTitle: 'South West annual',
            region: 'South West',
            transactionFile: 'nalei90002t',
            billGroupsCount: 2,
            billGroups: [
              {
                type: 'water-companies',
                caption: '1 water company',
                bills: [
                  {
                    id: '64924759-8142-4a08-9d1e-1e902cd9d316',
                    accountNumber: 'E22288888A',
                    billingContact: 'Acme Water Services Ltd',
                    licences: ['17/53/001/A/101', '17/53/002/B/205', '17/53/002/C/308'],
                    licencesCount: 3,
                    financialYear: 2023,
                    total: '£213,178.00'
                  }
                ]
              },
              {
                type: 'other-abstractors',
                caption: '1 other abstractor',
                bills: [
                  {
                    id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
                    accountNumber: 'E11101999A',
                    billingContact: 'Geordie Leforge',
                    licences: ['17/53/001/G/782'],
                    licencesCount: 1,
                    financialYear: 2023,
                    total: '£97.00'
                  }
                ]
              }
            ],
            view: 'bill-runs/view.njk'
          })
        })
      })

      describe('and it is linked to bills from a single group (water companies or other abstractors)', () => {
        beforeEach(() => {
          fetchBillRunResult = _singleGroupBillRun()
          Sinon.stub(FetchBillRunService, 'go').resolves(fetchBillRunResult)
        })

        it('will fetch the data and format it for use in the view bill run page', async () => {
          const result = await ViewBillRunService.go(testId)

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            billsCount: '1 Annual bill',
            billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
            billRunNumber: 10003,
            billRunStatus: 'sent',
            billRunTotal: '£97.00',
            billRunType: 'Annual',
            chargeScheme: 'Current',
            creditsCount: '0 credit notes',
            creditsTotal: '£0.00',
            dateCreated: '7 March 2023',
            debitsCount: '1 invoice',
            debitsTotal: '£97.00',
            displayCreditDebitTotals: false,
            financialYear: '2022 to 2023',
            pageTitle: 'South West annual',
            region: 'South West',
            transactionFile: 'nalei90002t',
            billGroupsCount: 1,
            billGroups: [
              {
                type: 'other-abstractors',
                caption: '1 other abstractor',
                bills: [
                  {
                    id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
                    accountNumber: 'E11101999A',
                    billingContact: 'Geordie Leforge',
                    licences: ['17/53/001/G/782'],
                    licencesCount: 1,
                    financialYear: 2023,
                    total: '£97.00'
                  }
                ]
              }
            ],
            view: 'bill-runs/view.njk'
          })
        })
      })
    })
  })

  describe('when a bill run with a matching ID does not exist', () => {
    beforeEach(() => {
      Sinon.stub(FetchBillRunService, 'go').resolves({
        billRun: undefined,
        billSummaries: []
      })
    })

    it('throws an exception', async () => {
      await expect(ViewBillRunService.go('testId')).to.reject()
    })
  })
})

function _multipleGroupBillRun() {
  const billSummaries = _billSummariesData()

  return {
    billRun: {
      id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
      batchType: 'annual',
      billRunNumber: 10003,
      creditNoteCount: 0,
      creditNoteValue: 0,
      errorCode: null,
      invoiceCount: 2,
      invoiceValue: 21327500,
      summer: false,
      netTotal: 21327500,
      scheme: 'sroc',
      source: 'wrls',
      status: 'sent',
      toFinancialYearEnding: 2023,
      transactionFileReference: 'nalei90002t',
      createdAt: new Date('2023-03-07'),
      region: {
        id: 'adca5dd3-114d-4477-8cdd-684081429f4b',
        displayName: 'South West'
      }
    },
    billSummaries
  }
}

function _singleGroupBillRun() {
  const billSummaries = _billSummariesData()

  delete billSummaries[1]

  return {
    billRun: {
      id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
      batchType: 'annual',
      billRunNumber: 10003,
      creditNoteCount: 0,
      creditNoteValue: 0,
      errorCode: null,
      invoiceCount: 1,
      invoiceValue: 9700,
      summer: false,
      netTotal: 9700,
      scheme: 'sroc',
      source: 'wrls',
      status: 'sent',
      toFinancialYearEnding: 2023,
      transactionFileReference: 'nalei90002t',
      createdAt: new Date('2023-03-07'),
      region: {
        id: 'adca5dd3-114d-4477-8cdd-684081429f4b',
        displayName: 'South West'
      }
    },
    billSummaries
  }
}

function _billSummariesData() {
  return [
    {
      id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
      billingAccountId: 'e8bd9fe1-47eb-42f2-a507-786bccd35aee',
      accountNumber: 'E11101999A',
      netAmount: 9700,
      financialYearEnding: 2023,
      companyName: 'H M Scotty & Daughter',
      agentName: 'Geordie Leforge',
      allLicences: '17/53/001/G/782',
      waterCompany: false
    },
    {
      id: '64924759-8142-4a08-9d1e-1e902cd9d316',
      billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
      accountNumber: 'E22288888A',
      netAmount: 21317800,
      financialYearEnding: 2023,
      companyName: 'Acme Water Services Ltd',
      agentName: null,
      allLicences: '17/53/001/A/101,17/53/002/B/205,17/53/002/C/308',
      waterCompany: true
    }
  ]
}
