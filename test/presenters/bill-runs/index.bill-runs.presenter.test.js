'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const IndexBillRunsPresenter = require('../../../app/presenters/bill-runs/index-bill-runs.presenter.js')

describe('Index Bill Runs presenter', () => {
  let billRuns

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      billRuns = _billRuns()
    })

    it('correctly presents the data', () => {
      const results = IndexBillRunsPresenter.go(billRuns)

      expect(results).to.equal([
        {
          id: '31fec553-f2de-40cf-a8d7-a5fb65f5761b',
          createdAt: '1 January 2024',
          link: '/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b',
          number: 1002,
          numberOfBills: 7,
          region: 'Avalon',
          scheme: 'sroc',
          status: 'ready',
          total: '£200.00',
          type: 'Supplementary'
        },
        {
          id: 'dfdde4c9-9a0e-440d-b297-7143903c6734',
          createdAt: '1 October 2023',
          link: '/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734',
          number: 1001,
          numberOfBills: 15,
          region: 'Albion',
          scheme: 'sroc',
          status: 'sent',
          total: '£300.00',
          type: 'Supplementary'
        }
      ])
    })

    describe("the 'link' property", () => {
      describe("when a bill run has the status 'review'", () => {
        beforeEach(() => {
          billRuns[0].status = 'review'
        })

        it('generates the href needed to link to the bill run review', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b/review')
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe("when a bill run does not have the status 'review'", () => {
        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })
    })
  })
})

function _billRuns () {
  return [
    {
      id: '31fec553-f2de-40cf-a8d7-a5fb65f5761b',
      batchType: 'supplementary',
      billRunNumber: 1002,
      createdAt: new Date('2024-01-01'),
      netTotal: 20000,
      scheme: 'sroc',
      status: 'ready',
      summer: false,
      numberOfBills: 7,
      region: 'Avalon'
    },
    {
      id: 'dfdde4c9-9a0e-440d-b297-7143903c6734',
      batchType: 'supplementary',
      billRunNumber: 1001,
      createdAt: new Date('2023-10-01'),
      netTotal: 30000,
      scheme: 'sroc',
      status: 'sent',
      summer: false,
      numberOfBills: 15,
      region: 'Albion'
    }
  ]
}
