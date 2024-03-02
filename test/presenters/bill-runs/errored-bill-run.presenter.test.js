'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ErroredBillRunPresenter = require('../../../app/presenters/bill-runs/errored-bill-run-presenter.js')

describe('Errored Bill Run presenter', () => {
  let billRun

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      billRun = _testBillRun()
    })

    it('correctly presents the data', () => {
      const result = ErroredBillRunPresenter.go(billRun)

      expect(result).to.equal({
        billRunId: '420e948f-1992-437e-8a47-74c0066cb017',
        billRunNumber: 10010,
        billRunStatus: 'error',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '1 November 2023',
        financialYear: '2023 to 2024',
        pageTitle: 'Wales supplementary',
        region: 'Wales'
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
    status: 'error',
    toFinancialYearEnding: 2024,
    createdAt: new Date('2023-11-01'),
    region: {
      id: 'f6c4699f-9a80-419a-82e7-f785ece727e1',
      displayName: 'Wales'
    }
  }
}
