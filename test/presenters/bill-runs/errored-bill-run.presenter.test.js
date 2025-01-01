'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

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
        errorMessage: 'Error when preparing the transactions.',
        financialYear: '2023 to 2024',
        pageTitle: 'Wales supplementary',
        region: 'Wales'
      })
    })

    describe('the "errorMessage" property', () => {
      describe('when the bill run has an error code', () => {
        beforeEach(() => {
          billRun.errorCode = 80
        })

        it('returns the matching error message', () => {
          const result = ErroredBillRunPresenter.go(billRun)

          expect(result.errorMessage).to.equal('Error when getting the Charging Module bill run summary.')
        })
      })

      describe('when the bill run does not have an error code', () => {
        beforeEach(() => {
          billRun.errorCode = null
        })

        it('returns the generic error message', () => {
          const result = ErroredBillRunPresenter.go(billRun)

          expect(result.errorMessage).to.equal(
            'No error code was assigned. We have no further information at this time.'
          )
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
    createdAt: new Date('2023-11-01'),
    errorCode: 30,
    scheme: 'sroc',
    status: 'error',
    summer: false,
    toFinancialYearEnding: 2024,
    region: {
      id: 'f6c4699f-9a80-419a-82e7-f785ece727e1',
      displayName: 'Wales'
    }
  }
}
