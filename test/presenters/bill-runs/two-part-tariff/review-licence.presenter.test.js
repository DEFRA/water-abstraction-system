'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReviewLicencePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

describe('Review Licence presenter', () => {
  describe('when there is data to be presented for review licence', () => {
    const matchedReturns = _matchingReturns()
    const unmatchedReturns = _unmatchedReturns()
    const chargePeriods = _chargePeriods()
    const billRun = _billRun()
    const licenceRef = { licenceRef: '7/34/10/*S/0084' }

    it('correctly presents the data', async () => {
      const result = ReviewLicencePresenter.go(matchedReturns, unmatchedReturns, chargePeriods, billRun, licenceRef)

      expect(result).to.equal({
        licenceRef: '7/34/10/*S/0084',
        billRunId: '6620135b-0ecf-4fd4-924e-371f950c0526',
        status: 'Review',
        region: 'Anglian',
        matchedReturns: [
          {
            reference: '10042959',
            dates: '1 April 2022 to 31 March 2023',
            status: 'complete',
            description: 'Ormesby Broad - Point 1',
            purpose: 'Spray Irrigation - Storage',
            total: '5 ML / 5 ML',
            allocated: 'Fully allocated'
          },
          {
            reference: '10042953',
            dates: '1 April 2022 to 31 March 2023',
            status: 'received',
            description: 'Ormesby Broad - Point 1',
            purpose: 'Spray Irrigation - Storage',
            total: '/',
            allocated: 'Not processed'
          },
          {
            reference: '10042952',
            dates: '1 April 2022 to 31 March 2023',
            status: 'overdue',
            description: 'Ormesby Broad - Point 1',
            purpose: 'Spray Irrigation - Storage',
            total: '/',
            allocated: 'Not processed'
          },
          {
            reference: '10042951',
            dates: '1 April 2022 to 31 March 2023',
            status: 'query',
            description: 'Ormesby Broad - Point 1',
            purpose: 'Spray Irrigation - Storage',
            total: '1 ML / 10 ML',
            allocated: 'Over abstraction'
          }
        ],
        unmatchedReturns: [
          {
            reference: '10042959',
            dates: '1 April 2022 to 31 March 2023',
            status: 'completed',
            description: 'Ormesby Broad - Point 1',
            purpose: 'Spray Irrigation - Storage',
            total: '0 ML / 20 ML'
          }
        ],
        chargePeriodDates: ['1 April 2022 to 31 March 2023']
      })
    })
  })
})

function _billRun () {
  return {
    id: '6620135b-0ecf-4fd4-924e-371f950c0526',
    region: {
      displayName: 'Anglian'
    }
  }
}

function _chargePeriods () {
  return [
    {
      startDate: new Date('2022-04-01'),
      endDate: new Date('2023-03-31')
    }
  ]
}

// Matching returns consists of 4 returns with status of 'complete', 'due', 'received' and 'underQuery'
// 1 return is fully allocated and another is over abstracted
function _matchingReturns () {
  return [
    {
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31'),
      reviewReturnResults: {
        returnReference: '10042959',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31'),
        dueDate: new Date('2023-04-28'),
        receivedDate: null,
        status: 'complete',
        underQuery: false,
        nilReturn: false,
        description: 'Ormesby Broad - Point 1',
        purposes: [{
          tertiary: {
            description: 'Spray Irrigation - Storage'
          }
        }],
        quantity: 5,
        allocated: 5,
        abstractionOutsidePeriod: false
      },
      licence: {
        licenceRef: '7/34/10/*S/0084'
      }
    },
    {
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31'),
      reviewReturnResults: {
        returnReference: '10042953',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31'),
        dueDate: new Date('2023-04-28'),
        receivedDate: null,
        status: 'received',
        underQuery: false,
        nilReturn: false,
        description: 'Ormesby Broad - Point 1',
        purposes: [{
          tertiary: {
            description: 'Spray Irrigation - Storage'
          }
        }],
        quantity: 0,
        allocated: 0,
        abstractionOutsidePeriod: false
      },
      licence: {
        licenceRef: '7/34/10/*S/0084'
      }
    },
    {
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31'),
      reviewReturnResults: {
        returnReference: '10042952',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31'),
        dueDate: new Date('2023-04-28'),
        receivedDate: null,
        status: 'due',
        underQuery: false,
        nilReturn: false,
        description: 'Ormesby Broad - Point 1',
        purposes: [{
          tertiary: {
            description: 'Spray Irrigation - Storage'
          }
        }],
        quantity: 0,
        allocated: 0,
        abstractionOutsidePeriod: false
      },
      licence: {
        licenceRef: '7/34/10/*S/0084'
      }
    },
    {
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31'),
      reviewReturnResults: {
        returnReference: '10042951',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31'),
        dueDate: new Date('2023-04-28'),
        receivedDate: null,
        status: 'complete',
        underQuery: true,
        nilReturn: false,
        description: 'Ormesby Broad - Point 1',
        purposes: [{
          tertiary: {
            description: 'Spray Irrigation - Storage'
          }
        }],
        quantity: 10,
        allocated: 1,
        abstractionOutsidePeriod: false
      },
      licence: {
        licenceRef: '7/34/10/*S/0084'
      }
    }
  ]
}

function _unmatchedReturns () {
  return [
    {
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31'),
      reviewReturnResults: {
        returnReference: '10042959',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31'),
        dueDate: new Date('2023-04-28'),
        receivedDate: null,
        status: 'completed',
        underQuery: false,
        nilReturn: false,
        description: 'Ormesby Broad - Point 1',
        purposes: [{
          tertiary: {
            description: 'Spray Irrigation - Storage'
          }
        }],
        quantity: 20,
        allocated: 0,
        abstractionOutsidePeriod: false
      },
      licence: {
        licenceRef: '7/34/10/*S/0084'
      }
    }
  ]
}
