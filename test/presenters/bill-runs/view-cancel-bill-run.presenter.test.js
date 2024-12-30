'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

// Thing under test
const ViewCancelBillRunPresenter = require('../../../app/presenters/bill-runs/view-cancel-bill-run.presenter.js')

describe('Bill Runs - View Cancel Bill Run presenter', () => {
  let billRun

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      billRun = _testBillRun()
    })

    it('correctly presents the data', () => {
      const result = ViewCancelBillRunPresenter.go(billRun)

      expect(result).to.equal({
        backLink: '/system/bill-runs/420e948f-1992-437e-8a47-74c0066cb017',
        billRunId: '420e948f-1992-437e-8a47-74c0066cb017',
        billRunNumber: 10010,
        billRunStatus: 'ready',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '1 November 2023',
        financialYear: '2023 to 2024',
        region: 'Wales'
      })
    })

    describe('the "backLink" property', () => {
      describe('when the bill run status is review', () => {
        beforeEach(() => {
          billRun.status = 'review'
        })

        describe('and the scheme is SROC', () => {
          it('returns a link to the SROC review page', () => {
            const result = ViewCancelBillRunPresenter.go(billRun)

            expect(result.backLink).to.equal('/system/bill-runs/review/420e948f-1992-437e-8a47-74c0066cb017')
          })
        })

        describe('and the scheme is PRESROC', () => {
          beforeEach(() => {
            billRun.scheme = 'alcs'
          })

          it('returns a link to the PRESROC review page', () => {
            const result = ViewCancelBillRunPresenter.go(billRun)

            expect(result.backLink).to.equal(
              '/billing/batch/420e948f-1992-437e-8a47-74c0066cb017/two-part-tariff-review'
            )
          })
        })
      })

      describe('when the bill run status is not review', () => {
        it('returns a link to the bill run page', () => {
          const result = ViewCancelBillRunPresenter.go(billRun)

          expect(result.backLink).to.equal('/system/bill-runs/420e948f-1992-437e-8a47-74c0066cb017')
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
    summer: false,
    scheme: 'sroc',
    status: 'ready',
    toFinancialYearEnding: 2024,
    createdAt: new Date('2023-11-01'),
    region: {
      id: 'f6c4699f-9a80-419a-82e7-f785ece727e1',
      displayName: 'Wales'
    }
  }
}
