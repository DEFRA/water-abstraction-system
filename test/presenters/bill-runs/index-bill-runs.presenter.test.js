'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const IndexBillRunsPresenter = require('../../../app/presenters/bill-runs/index-bill-runs.presenter.js')

describe('Index Bill Runs presenter', () => {
  const regions = [
    { id: '1d562e9a-2104-41d9-aa75-c008a7ec9059', displayName: 'Anglian' },
    { id: 'fd3d1154-c83d-4580-bcd6-46bfc380f233', displayName: 'Midlands' }
  ]

  let billRuns
  let busyResult
  let filters

  describe('when provided with a populated bill run', () => {
    beforeEach(() => {
      billRuns = _billRuns()
      busyResult = 'none'
      filters = { regions: [], runTypes: [], yearCreated: null, openFilter: false }
    })

    it('correctly presents the data', () => {
      const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

      expect(results).to.equal({
        billRuns: [
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
        ],
        notification: null,
        pageSubHeading: 'View a bill run',
        pageTitle: 'Bill runs',
        regionItems: [
          {
            checked: false,
            id: 'Anglian',
            text: 'Anglian',
            value: '1d562e9a-2104-41d9-aa75-c008a7ec9059'
          },
          {
            checked: false,
            id: 'Midlands',
            text: 'Midlands',
            value: 'fd3d1154-c83d-4580-bcd6-46bfc380f233'
          }
        ],
        runTypeItems: [
          {
            checked: false,
            id: 'annual',
            text: 'Annual',
            value: 'annual'
          },
          {
            checked: false,
            id: 'supplementary',
            text: 'Supplementary',
            value: 'supplementary'
          },
          {
            checked: false,
            id: 'two_part_tariff',
            text: 'Two-part tariff',
            value: 'two_part_tariff'
          },
          {
            checked: false,
            id: 'two_part_supplementary',
            text: 'Two-part tariff supplementary',
            value: 'two_part_supplementary'
          }
        ]
      })
    })

    describe('the "link" property', () => {
      describe('when a bill run has the status "cancel"', () => {
        beforeEach(() => {
          billRuns[0].status = 'cancel'
        })

        it('does not generate a href (returns null)', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.billRuns[0].link).to.be.null()
          expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "empty"', () => {
        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.billRuns[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "error"', () => {
        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.billRuns[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "processing"', () => {
        beforeEach(() => {
          billRuns[0].status = 'processing'
        })

        it('does not generate a href (returns null)', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.billRuns[0].link).to.be.null()
          expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "queued"', () => {
        beforeEach(() => {
          billRuns[0].status = 'queued'
        })

        it('does not generate a href (returns null)', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.billRuns[0].link).to.be.null()
          expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "ready"', () => {
        beforeEach(() => {
          billRuns[0].status = 'ready'
        })

        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.billRuns[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
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
            const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

            expect(results.billRuns[0].link).to.equal(
              '/billing/batch/31fec553-f2de-40cf-a8d7-a5fb65f5761b/two-part-tariff-review'
            )
            expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
          })
        })

        describe('and is for the "SROC" charge scheme', () => {
          it('generates the href needed to link to bill run review', () => {
            const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

            expect(results.billRuns[0].link).to.equal('/system/bill-runs/review/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
            expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
          })
        })
      })

      describe('when a bill run has the status "sending"', () => {
        beforeEach(() => {
          billRuns[0].status = 'sending'
        })

        it('does not generate a href (returns null)', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.billRuns[0].link).to.be.null()
          expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })

      describe('when a bill run has the status "sent"', () => {
        beforeEach(() => {
          billRuns[0].status = 'sent'
        })

        it('generates the href needed to link to the bill run', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.billRuns[0].link).to.equal('/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b')
          expect(results.billRuns[1].link).to.equal('/system/bill-runs/dfdde4c9-9a0e-440d-b297-7143903c6734')
        })
      })
    })

    describe('the "notification" property', () => {
      describe('when the state of busy bill runs is "none"', () => {
        beforeEach(() => {
          busyResult = 'none'
        })

        it('does not generate a notification', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.notification).to.be.null()
        })
      })

      describe('when the state of busy bill runs is "both"', () => {
        beforeEach(() => {
          busyResult = 'both'
        })

        it('returns the correct notification details', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.notification).to.equal({
            text: 'Please wait for these bill runs to finish before creating another one.',
            titleText: 'Busy building and cancelling'
          })
        })
      })

      describe('when the state of busy bill runs is "building"', () => {
        beforeEach(() => {
          busyResult = 'building'
        })

        it('returns the correct notification details', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.notification).to.equal({
            text: 'Please wait for this bill run to finish building before creating another one.',
            titleText: 'Busy building'
          })
        })
      })

      describe('when the state of busy bill runs is "cancelling"', () => {
        beforeEach(() => {
          busyResult = 'cancelling'
        })

        it('returns the correct notification details', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.notification).to.equal({
            text: 'Please wait for this bill run to finish cancelling before creating another one.',
            titleText: 'Busy cancelling'
          })
        })
      })
    })

    describe('the "regionItems" property', () => {
      describe('when no filters have been applied', () => {
        it('returns the region items, "checked" is set to false on all regions', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.regionItems).to.equal([
            {
              checked: false,
              id: 'Anglian',
              text: 'Anglian',
              value: '1d562e9a-2104-41d9-aa75-c008a7ec9059'
            },
            {
              checked: false,
              id: 'Midlands',
              text: 'Midlands',
              value: 'fd3d1154-c83d-4580-bcd6-46bfc380f233'
            }
          ])
        })
      })

      describe('when a filter on the "Anglian" region has been applied', () => {
        beforeEach(() => {
          filters.regions = ['1d562e9a-2104-41d9-aa75-c008a7ec9059']
        })

        it('returns the region items, "checked" is set to true on the "Anglian" region', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.regionItems).to.equal([
            {
              checked: true,
              id: 'Anglian',
              text: 'Anglian',
              value: '1d562e9a-2104-41d9-aa75-c008a7ec9059'
            },
            {
              checked: false,
              id: 'Midlands',
              text: 'Midlands',
              value: 'fd3d1154-c83d-4580-bcd6-46bfc380f233'
            }
          ])
        })
      })
    })

    describe('the "runTypeItems" property', () => {
      describe('when no filters have been applied', () => {
        it('returns the bill run type items, "checked" is set to false on all bill run types', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.runTypeItems).to.equal([
            {
              checked: false,
              id: 'annual',
              text: 'Annual',
              value: 'annual'
            },
            {
              checked: false,
              id: 'supplementary',
              text: 'Supplementary',
              value: 'supplementary'
            },
            {
              checked: false,
              id: 'two_part_tariff',
              text: 'Two-part tariff',
              value: 'two_part_tariff'
            },
            {
              checked: false,
              id: 'two_part_supplementary',
              text: 'Two-part tariff supplementary',
              value: 'two_part_supplementary'
            }
          ])
        })
      })

      describe('when a filter on the "Supplementary" bill run type has been applied', () => {
        beforeEach(() => {
          filters.runTypes = ['supplementary']
        })

        it('returns the bill run type items, "checked" is set to true on the "Supplementary" bill run type', () => {
          const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

          expect(results.runTypeItems).to.equal([
            {
              checked: false,
              id: 'annual',
              text: 'Annual',
              value: 'annual'
            },
            {
              checked: true,
              id: 'supplementary',
              text: 'Supplementary',
              value: 'supplementary'
            },
            {
              checked: false,
              id: 'two_part_tariff',
              text: 'Two-part tariff',
              value: 'two_part_tariff'
            },
            {
              checked: false,
              id: 'two_part_supplementary',
              text: 'Two-part tariff supplementary',
              value: 'two_part_supplementary'
            }
          ])
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
            const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

            expect(results.billRuns[0].total).to.equal('')
          })
        })
      })

      describe('when a bill run is two-part tariff supplementary', () => {
        describe('and has the status "review"', () => {
          beforeEach(() => {
            billRuns[0].batchType = 'two_part_supplementary'
            billRuns[0].status = 'review'
          })

          it('does not return a pound value', () => {
            const results = IndexBillRunsPresenter.go(billRuns, busyResult, filters, regions)

            expect(results.billRuns[0].total).to.equal('')
          })
        })
      })
    })
  })
})

function _billRuns() {
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
