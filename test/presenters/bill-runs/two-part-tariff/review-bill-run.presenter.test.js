'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

describe('Review Bill Run presenter', () => {
  describe('when there is data to be presented for review', () => {
    const testBillRun = _testBillRun()

    it('correctly presents the data', () => {
      const result = ReviewBillRunPresenter.go(testBillRun)

      expect(result).to.equal({
        region: 'Southern (Test replica)',
        status: 'review',
        dateCreated: '17 January 2024',
        financialYear: '2022 to 2023',
        billRunType: 'two-part tariff'
      })
    })
  })
})

function _testBillRun () {
  return {
    id: 'b21bd372-cd04-405d-824e-5180d854121c',
    createdAt: new Date('2024-01-17'),
    status: 'review',
    toFinancialYearEnding: 2023,
    batchType: 'two_part_tariff',
    region: {
      displayName: 'Southern (Test replica)'
    }
  }
}
