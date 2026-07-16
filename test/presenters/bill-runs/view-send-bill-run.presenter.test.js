// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import ViewSendBillRunPresenter from '../../../app/presenters/bill-runs/view-send-bill-run.presenter.js'

describe('Bill Runs - View Send Bill Run presenter', () => {
  let billRun

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      billRun = _testBillRun()
    })

    it('correctly presents the data', () => {
      const result = ViewSendBillRunPresenter(billRun)

      expect(result).toEqual({
        backLink: '/system/bill-runs/420e948f-1992-437e-8a47-74c0066cb017',
        billRunNumber: 10010,
        billRunStatus: 'ready',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '1 November 2023',
        financialYear: '2023 to 2024',
        pageTitle: "You're about to send this bill run",
        region: 'Wales'
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
