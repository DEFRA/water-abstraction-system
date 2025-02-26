'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { beforeEach, describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/review/review-bill-run.presenter.js')

describe('Bill Runs Review - Review Bill Run presenter', () => {
  describe('when there is data to be presented for review', () => {
    let filterIssues
    let filterLicenceHolderNumber
    let filterLicenceStatus
    let filterProgress
    let testBillRun
    let testLicences

    beforeEach(() => {
      testBillRun = _testBillRun()
      testLicences = _testLicences()
    })

    describe('and no filter has been applied', () => {
      beforeEach(() => {
        filterIssues = undefined
        filterLicenceHolderNumber = undefined
        filterLicenceStatus = undefined
        filterProgress = undefined
      })

      it('correctly presents the data', () => {
        const result = ReviewBillRunPresenter.go(
          testBillRun,
          filterIssues,
          filterLicenceHolderNumber,
          filterLicenceStatus,
          filterProgress,
          testLicences
        )

        expect(result).to.equal({
          billRunId: 'b21bd372-cd04-405d-824e-5180d854121c',
          billRunTitle: 'Southern (Test Replica) two-part tariff',
          billRunType: 'Two-part tariff',
          chargeScheme: 'Current',
          dateCreated: '17 January 2024',
          filter: {
            issues: undefined,
            licenceHolderNumber: undefined,
            licenceStatus: undefined,
            inProgress: undefined,
            openFilter: false
          },
          financialYear: '2022 to 2023',
          numberOfLicencesDisplayed: 3,
          numberOfLicencesToReview: 1,
          preparedLicences: [
            {
              id: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
              licenceRef: '1/11/11/*11/1111',
              licenceHolder: 'Big Farm Ltd',
              status: 'ready',
              progress: '',
              issue: ''
            },
            {
              id: '395bdc01-605b-44f5-9d90-5836cc013799',
              licenceRef: '2/22/22/*S2/2222',
              licenceHolder: 'Bob Bobbles',
              status: 'ready',
              progress: '✓',
              issue: 'Abstraction outside period'
            },
            {
              id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
              licenceRef: '3/33/33/*3/3333',
              licenceHolder: 'Farmer Palmer',
              status: 'review',
              progress: '',
              issue: 'Multiple Issues'
            }
          ],
          region: 'Southern (Test replica)',
          reviewMessage:
            'You need to review 1 licence with returns data issues. You can then continue and send the bill run.',
          status: 'review',
          totalNumberOfLicences: 3
        })
      })

      describe('and there are no licences in "review" status', () => {
        beforeEach(() => {
          testBillRun.reviewLicences[0].numberOfLicencesToReview = 0
        })

        it('correctly presents the data', () => {
          const result = ReviewBillRunPresenter.go(
            testBillRun,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            testLicences
          )

          expect(result.reviewMessage).to.equal(
            'You have resolved all returns data issues. Continue to generate bills.'
          )
        })
      })

      describe('and there are 2 licences in "review" status', () => {
        beforeEach(() => {
          testBillRun.reviewLicences[0].numberOfLicencesToReview = 2
        })

        it('correctly presents the data', () => {
          const result = ReviewBillRunPresenter.go(
            testBillRun,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            testLicences
          )

          expect(result.reviewMessage).to.equal(
            'You need to review 2 licences with returns data issues. You can then continue and send the bill run.'
          )
        })
      })
    })

    describe('and filters have been applied', () => {
      beforeEach(() => {
        filterIssues = ['abs-outside-period', 'over-abstraction']
        filterLicenceHolderNumber = 'bob'
        filterLicenceStatus = 'ready'
        filterProgress = true
      })

      it('correctly presents the data', () => {
        const result = ReviewBillRunPresenter.go(
          testBillRun,
          filterIssues,
          filterLicenceHolderNumber,
          filterLicenceStatus,
          filterProgress,
          testLicences
        )

        expect(result.filter.openFilter).to.equal(true)
        expect(result.filter.licenceHolderNumber).to.equal(filterLicenceHolderNumber)
        expect(result.filter.licenceStatus).to.equal(filterLicenceStatus)
        expect(result.filter.inProgress).to.equal(filterProgress)
        expect(result.filter.issues).to.equal({
          absOutsidePeriod: true,
          aggregateFactor: false,
          checkingQuery: false,
          multipleIssues: false,
          noIssues: false,
          noReturnsReceived: false,
          overAbstraction: true,
          overlapOfChargeDates: false,
          returnsReceivedNotProcessed: false,
          returnsLate: false,
          returnSplitOverRefs: false,
          someReturnsNotReceived: false,
          unableToMatchReturn: false
        })
      })
    })
  })
})

function _testBillRun() {
  return {
    id: 'b21bd372-cd04-405d-824e-5180d854121c',
    batchType: 'two_part_tariff',
    createdAt: new Date('2024-01-17'),
    scheme: 'sroc',
    status: 'review',
    summer: false,
    toFinancialYearEnding: 2023,
    region: {
      displayName: 'Southern (Test replica)'
    },
    reviewLicences: [{ totalNumberOfLicences: 3, numberOfLicencesToReview: 1 }]
  }
}

function _testLicences() {
  return [
    // Licence with no issues
    {
      id: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
      licenceRef: '1/11/11/*11/1111',
      licenceHolder: 'Big Farm Ltd',
      issues: '',
      progress: false,
      status: 'ready'
    },
    // Licence with a single issue
    {
      id: '395bdc01-605b-44f5-9d90-5836cc013799',
      licenceRef: '2/22/22/*S2/2222',
      licenceHolder: 'Bob Bobbles',
      issues: 'Abstraction outside period',
      progress: true,
      status: 'ready'
    },
    // Licence with multiple issues
    {
      id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      licenceRef: '3/33/33/*3/3333',
      licenceHolder: 'Farmer Palmer',
      issues: 'Abstraction outside period, Over abstraction, Overlap of charge dates',
      progress: false,
      status: 'review'
    }
  ]
}
