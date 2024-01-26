'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchReviewResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-results.service.js')

// Thing under test
const DetermineBillRunIssuesService = require('../../../../app/services/bill-runs/two-part-tariff/determine-bill-run-issues.service.js')

describe('Determine Bill Run Issues Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when given licences', () => {
    const licence = _licence()

    beforeEach(() => {
      Sinon.stub(FetchReviewResultsService, 'go')
        .onFirstCall().resolves(_readyLicenceReviewResults())
        .onSecondCall().resolves(_reviewLicenceReviewResults())
    })

    it('it fetches their review result records', async () => {
      await DetermineBillRunIssuesService.go(licence)

      expect(FetchReviewResultsService.go.called).to.be.true()
    })

    describe('that have issues', () => {
      it('marks the status on the licence as `review` or `ready', async () => {
        await DetermineBillRunIssuesService.go(licence)

        expect(licence[0].status).to.equal('ready')
        expect(licence[1].status).to.equal('review')
      })

      it('includes the specific issues on the licence', async () => {
        await DetermineBillRunIssuesService.go(licence)

        expect(licence[0].issues).to.equal([
          'Abstraction outside period',
          'No returns received',
          'Over abstraction',
          'Returns received late',
          'Some returns not received'])

        expect(licence[1].issues).to.equal([
          'Aggregate factor',
          'Checking query',
          'Overlap of charge dates',
          'Returns received but not processed',
          'Returns split over charge references',
          'Unable to match returns'])
      })
    })
  })
})

// The test data in _reviewLicenceReviewResults is set up to trigger all the issues with a status of review
function _reviewLicenceReviewResults () {
  return [
    {
      reviewChargeElementResultId: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
      chargeReferenceId: '8b44bdb9-3417-4d20-b9b2-0ca3438b6abb',
      reviewReturnResultId: '90eceec8-18de-4497-8102-3a7c6259d41a',
      reviewChargeElementResults: {
        id: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
        chargeDatesOverlap: true,
        aggregate: 0.5
      },
      reviewReturnResults: {
        id: '90eceec8-18de-4497-8102-3a7c6259d41a',
        underQuery: true,
        quantity: 0,
        allocated: 0,
        abstractionOutsidePeriod: false,
        status: 'received',
        dueDate: new Date('2023-04-28'),
        receivedDate: new Date('2023-04-28')
      }
    },
    {
      reviewChargeElementResultId: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
      chargeReferenceId: '90eceec8-18de-4497-8102-3a7c6259d41a',
      reviewReturnResultId: '90eceec8-18de-4497-8102-3a7c6259d41a',
      reviewChargeElementResults: {
        id: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
        chargeDatesOverlap: true,
        aggregate: 0.5
      },
      reviewReturnResults: {
        id: '90eceec8-18de-4497-8102-3a7c6259d41a',
        underQuery: true,
        quantity: 0,
        allocated: 0,
        abstractionOutsidePeriod: false,
        status: 'received',
        dueDate: new Date('2023-04-28'),
        receivedDate: new Date('2023-04-28')
      }
    },
    {
      reviewChargeElementResultId: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
      chargeReferenceId: '90eceec8-18de-4497-8102-3a7c6259d41a',
      reviewReturnResultId: null,
      reviewChargeElementResults: {
        id: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
        chargeDatesOverlap: true,
        aggregate: 0.5
      }
    }
  ]
}

// The test data in _readyLicenceReviewResults is set up to trigger all the issues with a status of ready
function _readyLicenceReviewResults () {
  return [
    {
      reviewChargeElementResultId: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
      chargeReferenceId: '8b44bdb9-3417-4d20-b9b2-0ca3438b6abb',
      reviewReturnResultId: '90eceec8-18de-4497-8102-3a7c6259d41a',
      reviewChargeElementResults: {
        id: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
        chargeDatesOverlap: false,
        aggregate: 1
      },
      reviewReturnResults: {
        id: '90eceec8-18de-4497-8102-3a7c6259d41a',
        underQuery: false,
        quantity: 1,
        allocated: 0.5,
        abstractionOutsidePeriod: true,
        status: 'due',
        dueDate: new Date('2023-04-28'),
        receivedDate: new Date('2023-04-29')
      }
    }
  ]
}

function _licence () {
  return [
    {
      licenceId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
      licenceHolder: 'Charles Wharton Ltd',
      licenceRef: '7/34/10/*S/0084'
    }, {
      licenceId: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      licenceHolder: 'LP Sneath',
      licenceRef: '5/31/14/*S/0116A'
    }
  ]
}
