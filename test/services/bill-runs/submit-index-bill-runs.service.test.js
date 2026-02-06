'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const CheckBusyBillRunsService = require('../../../app/services/bill-runs/check-busy-bill-runs.service.js')
const FetchBillRunsService = require('../../../app/services/bill-runs/fetch-bill-runs.service.js')
const FetchRegionsService = require('../../../app/services/bill-runs/setup/fetch-regions.service.js')

// Thing under test
const SubmitIndexBillRunsService = require('../../../app/services/bill-runs/submit-index-bill-runs.service.js')

describe('Bill Runs - Submit Index Bill Runs service', () => {
  let payload
  let yarStub

  beforeEach(() => {
    Sinon.stub(CheckBusyBillRunsService, 'go').resolves('none')
    Sinon.stub(FetchRegionsService, 'go').resolves([
      { id: '1d562e9a-2104-41d9-aa75-c008a7ec9059', displayName: 'Anglian' },
      { id: 'fd3d1154-c83d-4580-bcd6-46bfc380f233', displayName: 'Midlands' }
    ])

    yarStub = {
      clear: Sinon.stub().returns(),
      get: Sinon.stub(),
      set: Sinon.stub().returns()
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexBillRunsService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('clears the "billRunsFilter" object from the session', async () => {
        await SubmitIndexBillRunsService.go(payload, yarStub)

        expect(yarStub.clear.called).to.be.true()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexBillRunsService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('saves a default "billRunsFilter" object in the session', async () => {
        await SubmitIndexBillRunsService.go(payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal('billRunsFilter')
        expect(setArgs[1]).to.equal({ billRunTypes: [], regions: [], yearCreated: null })
      })
    })

    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { yearCreated: '2025' }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexBillRunsService.go(payload, yarStub)

        expect(result).to.equal({})
      })

      it('saves the state of the filters as the "billRunsFilter" object in the session', async () => {
        await SubmitIndexBillRunsService.go(payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal('billRunsFilter')
        expect(setArgs[1]).to.equal({ billRunTypes: [], regions: [], yearCreated: '2025' })
      })

      describe('and a single bill run type filter has been selected ("billRunTypes" is a string)', () => {
        beforeEach(() => {
          payload = { billRunTypes: 'annual' }
        })

        it('saves the state of the bill run type filter as an array in the session', async () => {
          await SubmitIndexBillRunsService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('billRunsFilter')
          expect(setArgs[1]).to.equal({
            billRunTypes: ['annual'],
            regions: [],
            yearCreated: null
          })
        })
      })

      describe('and multiple bill run type filters have been selected ("billRunTypes" is an array)', () => {
        beforeEach(() => {
          payload = {
            billRunTypes: ['annual', 'supplementary']
          }
        })

        it('saves the state of the bill run type filter as an array in the session', async () => {
          await SubmitIndexBillRunsService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('billRunsFilter')
          expect(setArgs[1]).to.equal({
            billRunTypes: ['annual', 'supplementary'],
            regions: [],
            yearCreated: null
          })
        })
      })

      describe('and a single region filter has been selected ("regions" is a string)', () => {
        beforeEach(() => {
          payload = { regions: '1d562e9a-2104-41d9-aa75-c008a7ec9059', yearCreated: '2025' }
        })

        it('saves the state of the region filter as an array in the session', async () => {
          await SubmitIndexBillRunsService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('billRunsFilter')
          expect(setArgs[1]).to.equal({
            billRunTypes: [],
            regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059'],
            yearCreated: '2025'
          })
        })
      })

      describe('and multiple region filters have been selected ("regions" is an array)', () => {
        beforeEach(() => {
          payload = {
            regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059', 'fd3d1154-c83d-4580-bcd6-46bfc380f233']
          }
        })

        it('saves the state of the region filter as an array in the session', async () => {
          await SubmitIndexBillRunsService.go(payload, yarStub)

          const setArgs = yarStub.set.args[0]

          expect(setArgs[0]).to.equal('billRunsFilter')
          expect(setArgs[1]).to.equal({
            billRunTypes: [],
            regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059', 'fd3d1154-c83d-4580-bcd6-46bfc380f233'],
            yearCreated: null
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = { yearCreated: 'invalid-year' }
      })

      describe('and the results are paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchBillRunsService, 'go').resolves({
            results: _fetchedBillRuns(),
            total: 70
          })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexBillRunsService.go(payload, yarStub, '2')

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            error: {
              errorList: [{ href: '#yearCreated', text: 'The year created must be a number' }],
              yearCreated: { text: 'The year created must be a number' }
            },
            filters: { billRunTypes: [], openFilter: true, regions: [], yearCreated: 'invalid-year' },
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
            billRunTypeItems: [
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
            ],
            notification: null,
            pageSubHeading: 'View a bill run',
            pageTitle: 'Bill runs',
            pagination: {
              component: {
                items: [
                  {
                    current: false,
                    href: '/system/bill-runs?page=1',
                    number: 1,
                    visuallyHiddenText: 'Page 1'
                  },
                  {
                    current: true,
                    href: '/system/bill-runs?page=2',
                    number: 2,
                    visuallyHiddenText: 'Page 2'
                  },
                  {
                    current: false,
                    href: '/system/bill-runs?page=3',
                    number: 3,
                    visuallyHiddenText: 'Page 3'
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=3'
                },
                previous: {
                  href: '/system/bill-runs?page=1'
                }
              },
              numberOfPages: 3,
              showingMessage: 'Showing 2 of 70 bill runs'
            },
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
            ]
          })
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchBillRunsService, 'go').resolves({
            results: _fetchedBillRuns(),
            total: 2
          })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexBillRunsService.go(payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            error: {
              errorList: [{ href: '#yearCreated', text: 'The year created must be a number' }],
              yearCreated: { text: 'The year created must be a number' }
            },
            filters: { billRunTypes: [], openFilter: true, regions: [], yearCreated: 'invalid-year' },
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
            billRunTypeItems: [
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
            ],
            notification: null,
            pageSubHeading: 'View a bill run',
            pageTitle: 'Bill runs',
            pagination: {
              numberOfPages: 1,
              showingMessage: 'Showing all 2 bill runs'
            },
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
            ]
          })
        })
      })
    })
  })
})

function _fetchedBillRuns() {
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
