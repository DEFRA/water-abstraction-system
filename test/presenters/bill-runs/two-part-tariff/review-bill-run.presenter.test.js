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
    const testLicences = _testLicences()

    it('correctly presents the data', () => {
      const result = ReviewBillRunPresenter.go(testBillRun, testLicences)

      expect(result).to.equal({
        region: 'Southern (Test replica)',
        status: 'review',
        dateCreated: '17 January 2024',
        financialYear: '2022 to 2023',
        billRunType: 'two-part tariff',
        numberOfLicencesDisplayed: 3,
        licencesToReviewCount: 1,
        totalNumberOfLicences: 3,
        preparedLicences: [
          {
            id: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
            licenceRef: '1/11/11/*11/1111',
            licenceHolder: 'Big Farm Ltd',
            status: 'ready',
            issue: ''
          },
          {
            id: '395bdc01-605b-44f5-9d90-5836cc013799',
            licenceRef: '2/22/22/*S2/2222',
            licenceHolder: 'Bob Bobbles',
            status: 'ready',
            issue: 'Abstraction outside period'
          },
          {
            id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
            licenceRef: '3/33/33/*3/3333',
            licenceHolder: 'Farmer Palmer',
            status: 'review',
            issue: 'Multiple Issues'
          }
        ],
        filterData: { openFilter: false }
      })
    })

    describe('and a filter has been applied', () => {
      const filterLicenceHolder = 'big farm'

      it('correctly presents the data', () => {
        const result = ReviewBillRunPresenter.go(testBillRun, testLicences, filterLicenceHolder)

        expect(result.filterData.openFilter).to.equal(true)
        expect(result.filterData.licenceHolder).to.equal(filterLicenceHolder)
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
    },
    reviewLicences: [{ totalNumberOfLicences: 3 }]
  }
}

function _testLicences () {
  return [
    // Licence with no issues
    {
      licenceId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
      licenceRef: '1/11/11/*11/1111',
      licenceHolder: 'Big Farm Ltd',
      issues: '',
      status: 'ready'
    },
    // Licence with a single issue
    {
      licenceId: '395bdc01-605b-44f5-9d90-5836cc013799',
      licenceRef: '2/22/22/*S2/2222',
      licenceHolder: 'Bob Bobbles',
      issues: 'Abstraction outside period',
      status: 'ready'
    },
    // Licence with multiple issues
    {
      licenceId: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      licenceRef: '3/33/33/*3/3333',
      licenceHolder: 'Farmer Palmer',
      issues: 'Abstraction outside period, Over abstraction, Overlap of charge dates',
      status: 'review'
    }
  ]
}
