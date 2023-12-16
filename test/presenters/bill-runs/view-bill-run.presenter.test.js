'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewBillRunPresenter = require('../../../app/presenters/bill-runs/view-bill-run.presenter.js')

describe('View Bill Run presenter', () => {
  let billRun
  let billRunSummaries

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      billRun = _testBillRun()
      billRunSummaries = _testBillSummaries()
    })

    it('correctly presents the data', () => {
      const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

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

    describe("the 'billsCount' property", () => {
      describe('when the sum of the invoice and credit count is 1', () => {
        beforeEach(() => {
          billRun.creditNoteCount = 0
          billRun.invoiceCount = 1
        })

        it('returns to sum plus the bill run type as singular (1 Supplementary bill)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.billsCount).to.equal('1 Supplementary bill')
        })
      })

      describe('when the sum of the invoice and credit count is more than 1', () => {
        beforeEach(() => {
          billRun.batchType = 'annual'
          billRun.creditNoteCount = 5
          billRun.invoiceCount = 7
        })

        it('returns to sum plus the bill run type pluralised (12 Annual bills)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.billsCount).to.equal('12 Annual bills')
        })
      })
    })

    describe("the 'billRunTotal' property", () => {
      describe('when the net total is greater than 0', () => {
        it('returns the value converted to pounds, formatted as money and showing as a debit (£707.00)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.billRunTotal).to.equal('£707.00')
        })
      })

      describe('when the net total is zero', () => {
        beforeEach(() => {
          billRun.netTotal = 0
        })

        it('returns the value converted to pounds, formatted as money and showing as a debit (£0.00)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.billRunTotal).to.equal('£0.00')
        })
      })

      describe('when the net total is less than zero', () => {
        beforeEach(() => {
          billRun.netTotal = -70700
        })

        it('returns the value converted to pounds, formatted as money and showing as a credit (£707.00 credit)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.billRunTotal).to.equal('£707.00 credit')
        })
      })
    })

    describe("the 'billRunType' property", () => {
      describe('when the bill run is annual', () => {
        beforeEach(() => {
          billRun.batchType = 'annual'
        })

        it('returns Annual', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.billRunType).to.equal('Annual')
        })
      })

      describe('when the bill run is supplementary', () => {
        it('returns Supplementary', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.billRunType).to.equal('Supplementary')
        })
      })

      describe('when the bill run is two_part_tariff', () => {
        beforeEach(() => {
          billRun.batchType = 'two_part_tariff'
        })

        describe('and the scheme is sroc', () => {
          it('returns Supplementary', () => {
            const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

            expect(result.billRunType).to.equal('Two-part tariff')
          })
        })

        describe('and the scheme is alcs', () => {
          beforeEach(() => {
            billRun.scheme = 'alcs'
          })

          describe('and it is not summer only', () => {
            it('returns Supplementary', () => {
              const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

              expect(result.billRunType).to.equal('Two-part tariff winter and all year')
            })
          })

          describe('and it is for summer only', () => {
            beforeEach(() => {
              billRun.summer = true
            })

            it('returns Supplementary', () => {
              const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

              expect(result.billRunType).to.equal('Two-part tariff summer')
            })
          })
        })
      })
    })

    describe("the 'chargeScheme' property", () => {
      describe('when the bill run is sroc', () => {
        it('returns Current', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.chargeScheme).to.equal('Current')
        })
      })

      describe('when the bill run is alcs', () => {
        beforeEach(() => {
          billRun.scheme = 'alcs'
        })

        it('returns Old', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.chargeScheme).to.equal('Old')
        })
      })
    })

    describe("the 'creditsCount' property", () => {
      describe('when there is only 1 credit note', () => {
        beforeEach(() => {
          billRun.creditNoteCount = 1
        })

        it('returns the count singular (1 credit note)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.creditsCount).to.equal('1 credit note')
        })
      })

      describe('when there are multiple credit notes', () => {
        it('returns the count pluralised (2 credit notes)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.creditsCount).to.equal('2 credit notes')
        })
      })
    })

    describe("the 'debitsCount' property", () => {
      describe('when there is only 1 invoice', () => {
        beforeEach(() => {
          billRun.invoiceCount = 1
        })

        it('returns the count singular (1 invoice)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.debitsCount).to.equal('1 invoice')
        })
      })

      describe('when there are multiple invoices', () => {
        it('returns the count pluralised (6 invoices)', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.debitsCount).to.equal('6 invoices')
        })
      })
    })

    describe("the 'displayCreditDebitTotals' property", () => {
      describe('when the bill run is not supplementary', () => {
        beforeEach(() => {
          billRun.batchType = 'annual'
        })

        it('returns false', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.displayCreditDebitTotals).to.be.false()
        })
      })

      describe('when the bill run is supplementary', () => {
        it('returns true', () => {
          const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

          expect(result.displayCreditDebitTotals).to.be.true()
        })
      })
    })

    describe("the 'financialYear' property", () => {
      it('returns the to and from financial year (2023 to 2024)', () => {
        const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

        expect(result.financialYear).to.equal('2023 to 2024')
      })
    })

    describe("the 'pageTitle' property", () => {
      it('returns the region name and bill run type (Wales supplementary)', () => {
        const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

        expect(result.pageTitle).to.equal('Wales supplementary')
      })
    })

    describe("the 'region' property", () => {
      it("returns the bill run's region display name capitalized (Wales)", () => {
        const result = ViewBillRunPresenter.go(billRun, billRunSummaries)

        expect(result.region).to.equal('Wales')
      })
    })
  })
})

function _testBillRun () {
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

function _testBillSummaries () {
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
    }
  ]
}
