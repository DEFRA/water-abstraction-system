'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewBillRunPresenter = require('../../../app/presenters/bill-runs/view-bill-run.presenter.js')

describe('View Bill Run presenter', () => {
  let billRun
  let billSummaries

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      billRun = _testBillRun()
      billSummaries = _testBillSummaries()
    })

    it('correctly presents the data', () => {
      const result = ViewBillRunPresenter.go(billRun, billSummaries)

      expect(result).to.equal({
        billsCount: '8 Supplementary bills',
        billRunId: '420e948f-1992-437e-8a47-74c0066cb017',
        billRunNumber: 10010,
        billRunStatus: 'sent',
        billRunTotal: '£707.00',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        creditsCount: '2 credit notes',
        creditsTotal: '£1,992.78',
        dateCreated: '1 November 2023',
        debitsCount: '6 invoices',
        debitsTotal: '£2,699.78',
        displayCreditDebitTotals: true,
        financialYear: '2023 to 2024',
        pageTitle: 'Wales supplementary',
        region: 'Wales',
        transactionFile: 'nalwi50002t'
      })
    })

    describe('the "billsCount" property', () => {
      // NOTE: We have no tests for zero value bills in this scenario because a bill run won't exist if it just contains
      // a single zero value bill. So, if there is only one bill it must be a credit or an invoice
      describe('when the sum of the invoice and credit count is 1', () => {
        beforeEach(() => {
          billRun.creditNoteCount = 0
          billRun.invoiceCount = 1
        })

        it('returns 1 plus the bill run type as singular (1 Supplementary bill)', () => {
          const result = ViewBillRunPresenter.go(billRun, billSummaries)

          expect(result.billsCount).to.equal('1 Supplementary bill')
        })
      })

      describe('when the sum of the invoice and credit count is more than 1', () => {
        beforeEach(() => {
          billRun.creditNoteCount = 5
          billRun.invoiceCount = 7
        })

        describe('and there are no zero value bills', () => {
          it('returns the sum plus the bill run type pluralised (12 Supplementary bills)', () => {
            const result = ViewBillRunPresenter.go(billRun, billSummaries)

            expect(result.billsCount).to.equal('12 Supplementary bills')
          })
        })

        describe('and there is 1 zero value bill', () => {
          beforeEach(() => {
            billSummaries[0].netAmount = 0
          })

          it('returns the sum plus the bill run type pluralised and zero value as singular (12 Supplementary bills and 1 zero value bill)', () => {
            const result = ViewBillRunPresenter.go(billRun, billSummaries)

            expect(result.billsCount).to.equal('12 Supplementary bills and 1 zero value bill')
          })
        })

        describe('and there are multiple zero value bills', () => {
          beforeEach(() => {
            billSummaries[0].netAmount = 0
            billSummaries[1].netAmount = 0
          })

          it('returns the sum plus the bill run type and zero value pluralised (12 Supplementary bills and 2 zero value bills)', () => {
            const result = ViewBillRunPresenter.go(billRun, billSummaries)

            expect(result.billsCount).to.equal('12 Supplementary bills and 2 zero value bills')
          })
        })
      })
    })

    describe('the "billRunTotal" property', () => {
      describe('when the net total is greater than 0', () => {
        it('returns the value converted to pounds, formatted as money and showing as a debit (£707.00)', () => {
          const result = ViewBillRunPresenter.go(billRun, billSummaries)

          expect(result.billRunTotal).to.equal('£707.00')
        })
      })

      describe('when the net total is zero', () => {
        beforeEach(() => {
          billRun.netTotal = 0
        })

        it('returns the value converted to pounds, formatted as money and showing as a debit (£0.00)', () => {
          const result = ViewBillRunPresenter.go(billRun, billSummaries)

          expect(result.billRunTotal).to.equal('£0.00')
        })
      })

      describe('when the net total is less than zero', () => {
        beforeEach(() => {
          billRun.netTotal = -70700
        })

        it('returns the value converted to pounds, formatted as money and showing as a credit (£707.00 credit)', () => {
          const result = ViewBillRunPresenter.go(billRun, billSummaries)

          expect(result.billRunTotal).to.equal('£707.00 credit')
        })
      })
    })

    describe('the "creditsCount" property', () => {
      describe('when there is only 1 credit note', () => {
        beforeEach(() => {
          billRun.creditNoteCount = 1
        })

        it('returns the count singular (1 credit note)', () => {
          const result = ViewBillRunPresenter.go(billRun, billSummaries)

          expect(result.creditsCount).to.equal('1 credit note')
        })
      })

      describe('when there are multiple credit notes', () => {
        it('returns the count pluralised (2 credit notes)', () => {
          const result = ViewBillRunPresenter.go(billRun, billSummaries)

          expect(result.creditsCount).to.equal('2 credit notes')
        })
      })
    })

    describe('the "debitsCount" property', () => {
      describe('when there is only 1 invoice', () => {
        beforeEach(() => {
          billRun.invoiceCount = 1
        })

        it('returns the count singular (1 invoice)', () => {
          const result = ViewBillRunPresenter.go(billRun, billSummaries)

          expect(result.debitsCount).to.equal('1 invoice')
        })
      })

      describe('when there are multiple invoices', () => {
        it('returns the count pluralised (6 invoices)', () => {
          const result = ViewBillRunPresenter.go(billRun, billSummaries)

          expect(result.debitsCount).to.equal('6 invoices')
        })
      })
    })
  })
})

function _testBillRun() {
  return {
    id: '420e948f-1992-437e-8a47-74c0066cb017',
    batchType: 'supplementary',
    billRunNumber: 10010,
    creditNoteCount: 2,
    creditNoteValue: -199278,
    invoiceCount: 6,
    invoiceValue: 269978,
    summer: false,
    netTotal: 70700,
    scheme: 'sroc',
    source: 'wrls',
    status: 'sent',
    toFinancialYearEnding: 2024,
    transactionFileReference: 'nalwi50002t',
    createdAt: new Date('2023-11-01'),
    region: {
      id: 'f6c4699f-9a80-419a-82e7-f785ece727e1',
      displayName: 'Wales'
    }
  }
}

function _testBillSummaries() {
  return [
    {
      id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
      billingAccountId: 'e8bd9fe1-47eb-42f2-a507-786bccd35aee',
      accountNumber: 'E11101999A',
      netAmount: -9700,
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
