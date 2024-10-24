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

    describe('the "link" property', () => {
      describe('when a bill run has the status "cancel"', () => {
        beforeEach(() => {
          billRuns[0].status = 'cancel'
        })

        it('does not generate a href (returns null)', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.be.null()
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "empty"', () => {
        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "error"', () => {
        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "processing"', () => {
        beforeEach(() => {
          billRuns[0].status = 'processing'
        })

        it('does not generate a href (returns null)', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.be.null()
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "queued"', () => {
        beforeEach(() => {
          billRuns[0].status = 'queued'
        })

        it('does not generate a href (returns null)', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.be.null()
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "ready"', () => {
        beforeEach(() => {
          billRuns[0].status = 'ready'
        })

        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "review"', () => {
        beforeEach(() => {
          billRuns[0].status = 'review'
        })

        describe('and is for the "PRESROC" charge scheme', () => {
          beforeEach(() => {
            billRuns[0].scheme = 'alcs'
          })

          it('generates the href needed to link to the old bill run review', () => {
            const results = IndexBillRunsPresenter.go(billRuns)

            expect(results[0].link).to.equal('/billing/batch/31fec553-f2de-40cf-a8d7-a5fb65f5761b/two-part-tariff-review')
            expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
          })
        })

        describe('and is for the "SROC" charge scheme', () => {
          it('generates the href needed to link to bill run review', () => {
            const results = IndexBillRunsPresenter.go(billRuns)

            expect(results[0].link).to.equal('/system/bill-runs/review/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
            expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
          })
        })
      })

      describe('when a bill run has the status "sending"', () => {
        beforeEach(() => {
          billRuns[0].status = 'sending'
        })

        it('does not generate a href (returns null)', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.be.null()
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "sent"', () => {
        beforeEach(() => {
          billRuns[0].status = 'sent'
        })

        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns)

          expect(results[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })
    })

    describe('the "total" property', () => {
      describe('when a bill run is two-part tariff', () => {
        describe('and has the status "review"', () => {
          beforeEach(() => {
            billRuns[0].batchType = 'two_part_tariff'
            billRuns[0].status = 'review'
          })

          it('does not return a pound value', () => {
            const results = IndexBillRunsPresenter.go(billRuns)

            expect(results[0].total).to.equal('')
          })
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
