'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CancelBillRunPresenter = require('../../../app/presenters/bill-runs/cancel-bill-run.presenter.js')

describe('Cancel Bill Run presenter', () => {
  let billRun

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      billRun = _testBillRun()
    })

    it('correctly presents the data', () => {
      const result = CancelBillRunPresenter.go(billRun)

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

    describe("the 'backLink' property", () => {
      describe('when the bill run status is review', () => {
        beforeEach(() => {
          billRun.status = 'review'
        })

        it('returns a link to the review page', () => {
          const result = CancelBillRunPresenter.go(billRun)

          expect(result.backLink).to.equal('/system/bill-runs/420e948f-1992-437e-8a47-74c0066cb017/review')
        })
      })

      describe('when the bill run status is not review', () => {
        it('returns a link to the bill run page', () => {
          const result = CancelBillRunPresenter.go(billRun)

          expect(result.backLink).to.equal('/system/bill-runs/420e948f-1992-437e-8a47-74c0066cb017')
        })
      })
    })
  })
})

function _testBillRun () {
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
