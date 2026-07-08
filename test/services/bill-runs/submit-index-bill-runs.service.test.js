// Test framework dependencies

// Things to stub
import CheckBusyBillRunsService from '../../../app/services/bill-runs/check-busy-bill-runs.service.js'
import FetchBillRunsService from '../../../app/services/bill-runs/fetch-bill-runs.service.js'
import FetchRegionsService from '../../../app/services/bill-runs/setup/fetch-regions.service.js'
import YarStub from '../../support/stubs/yar.stub.js'

// Thing under test
import SubmitIndexBillRunsService from '../../../app/services/bill-runs/submit-index-bill-runs.service.js'

describe('Bill Runs - Submit Index Bill Runs service', () => {
  let payload
  let yarStub

  beforeEach(() => {
    vi.mock('../../../app/services/bill-runs/check-busy-bill-runs.service.js')
    CheckBusyBillRunsService.mockResolvedValue('none')
    vi.mock('../../../app/services/bill-runs/setup/fetch-regions.service.js')
    FetchRegionsService.mockResolvedValue([
      { id: '1d562e9a-2104-41d9-aa75-c008a7ec9059', displayName: 'Anglian' },
      { id: 'fd3d1154-c83d-4580-bcd6-46bfc380f233', displayName: 'Midlands' }
    ])

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexBillRunsService(payload, yarStub)

        expect(result).toEqual({})
      })

      it('clears the "billRunsFilter" object from the session', async () => {
        await SubmitIndexBillRunsService(payload, yarStub)

        expect(yarStub.clear).toHaveBeenCalled()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexBillRunsService(payload, yarStub)

        expect(result).toEqual({})
      })

      it('saves a default "billRunsFilter" object in the session', async () => {
        await SubmitIndexBillRunsService(payload, yarStub)

        const setArgs = yarStub.set.mock.calls[0]

        expect(setArgs[0]).toEqual('billRunsFilter')
        expect(setArgs[1]).toEqual({ number: null, regions: [], runTypes: [], statuses: [], yearCreated: null })
      })
    })

    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { number: '1001', yearCreated: '2025' }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexBillRunsService(payload, yarStub)

        expect(result).toEqual({})
      })

      it('saves the state of the filters as the "billRunsFilter" object in the session', async () => {
        await SubmitIndexBillRunsService(payload, yarStub)

        const setArgs = yarStub.set.mock.calls[0]

        expect(setArgs[0]).toEqual('billRunsFilter')
        expect(setArgs[1]).toEqual({ number: '1001', regions: [], runTypes: [], statuses: [], yearCreated: '2025' })
      })

      describe('and a single "Run type" filter has been selected ("runTypes" is a string)', () => {
        beforeEach(() => {
          payload = { runTypes: 'annual' }
        })

        it('saves the state of the "Run type" filter as an array in the session', async () => {
          await SubmitIndexBillRunsService(payload, yarStub)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('billRunsFilter')
          expect(setArgs[1]).toEqual({
            number: null,
            regions: [],
            runTypes: ['annual'],
            statuses: [],
            yearCreated: null
          })
        })
      })

      describe('and multiple "Run type" filters have been selected ("runTypes" is an array)', () => {
        beforeEach(() => {
          payload = {
            runTypes: ['annual', 'supplementary']
          }
        })

        it('saves the state of the "Run type" filter as an array in the session', async () => {
          await SubmitIndexBillRunsService(payload, yarStub)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('billRunsFilter')
          expect(setArgs[1]).toEqual({
            number: null,
            regions: [],
            runTypes: ['annual', 'supplementary'],
            statuses: [],
            yearCreated: null
          })
        })
      })

      describe('and a single "Region" filter has been selected ("regions" is a string)', () => {
        beforeEach(() => {
          payload = { regions: '1d562e9a-2104-41d9-aa75-c008a7ec9059', yearCreated: '2025' }
        })

        it('saves the state of the "Region" filter as an array in the session', async () => {
          await SubmitIndexBillRunsService(payload, yarStub)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('billRunsFilter')
          expect(setArgs[1]).toEqual({
            number: null,
            regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059'],
            runTypes: [],
            statuses: [],
            yearCreated: '2025'
          })
        })
      })

      describe('and multiple "Region" filters have been selected ("regions" is an array)', () => {
        beforeEach(() => {
          payload = {
            regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059', 'fd3d1154-c83d-4580-bcd6-46bfc380f233']
          }
        })

        it('saves the state of the "Region" filter as an array in the session', async () => {
          await SubmitIndexBillRunsService(payload, yarStub)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('billRunsFilter')
          expect(setArgs[1]).toEqual({
            number: null,
            regions: ['1d562e9a-2104-41d9-aa75-c008a7ec9059', 'fd3d1154-c83d-4580-bcd6-46bfc380f233'],
            runTypes: [],
            statuses: [],
            yearCreated: null
          })
        })
      })

      describe('and a single "Status" filter has been selected ("statuses" is a string)', () => {
        beforeEach(() => {
          payload = { statuses: 'sent' }
        })

        it('saves the state of the "Status" filter as an array in the session', async () => {
          await SubmitIndexBillRunsService(payload, yarStub)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('billRunsFilter')
          expect(setArgs[1]).toEqual({
            number: null,
            regions: [],
            runTypes: [],
            statuses: ['sent'],
            yearCreated: null
          })
        })
      })

      describe('and multiple "Status" filters have been selected ("statuses" is an array)', () => {
        beforeEach(() => {
          payload = {
            statuses: ['ready', 'review']
          }
        })

        it('saves the state of the "Status" filter as an array in the session', async () => {
          await SubmitIndexBillRunsService(payload, yarStub)

          const setArgs = yarStub.set.mock.calls[0]

          expect(setArgs[0]).toEqual('billRunsFilter')
          expect(setArgs[1]).toEqual({
            number: null,
            regions: [],
            runTypes: [],
            statuses: ['ready', 'review'],
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
          vi.mock('../../../app/services/bill-runs/fetch-bill-runs.service.js')
          FetchBillRunsService.mockResolvedValue({
            results: _fetchedBillRuns(),
            total: 70
          })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexBillRunsService(payload, yarStub, '2')

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            error: {
              errorList: [{ href: '#yearCreated', text: 'The Year created must be a number' }],
              yearCreated: { text: 'The Year created must be a number' }
            },
            filters: {
              number: null,
              openFilter: true,
              regions: [],
              runTypes: [],
              statuses: [],
              yearCreated: 'invalid-year'
            },
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
              currentPageNumber: 2,
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
            ],
            statusItems: [
              {
                checked: false,
                id: 'processing',
                text: 'Building',
                value: 'processing'
              },
              {
                checked: false,
                id: 'cancel',
                text: 'Cancelling',
                value: 'cancel'
              },
              {
                checked: false,
                id: 'empty',
                text: 'Empty',
                value: 'empty'
              },
              {
                checked: false,
                id: 'error',
                text: 'Error',
                value: 'error'
              },
              {
                checked: false,
                id: 'ready',
                text: 'Ready',
                value: 'ready'
              },
              {
                checked: false,
                id: 'review',
                text: 'Review',
                value: 'review'
              },
              {
                checked: false,
                id: 'sent',
                text: 'Sent',
                value: 'sent'
              }
            ]
          })
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          vi.mock('../../../app/services/bill-runs/fetch-bill-runs.service.js')
          FetchBillRunsService.mockResolvedValue({
            results: _fetchedBillRuns(),
            total: 2
          })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexBillRunsService(payload, yarStub)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            error: {
              errorList: [{ href: '#yearCreated', text: 'The Year created must be a number' }],
              yearCreated: { text: 'The Year created must be a number' }
            },
            filters: {
              number: null,
              openFilter: true,
              regions: [],
              runTypes: [],
              statuses: [],
              yearCreated: 'invalid-year'
            },
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
            pagination: {
              currentPageNumber: 1,
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
            ],
            statusItems: [
              {
                checked: false,
                id: 'processing',
                text: 'Building',
                value: 'processing'
              },
              {
                checked: false,
                id: 'cancel',
                text: 'Cancelling',
                value: 'cancel'
              },
              {
                checked: false,
                id: 'empty',
                text: 'Empty',
                value: 'empty'
              },
              {
                checked: false,
                id: 'error',
                text: 'Error',
                value: 'error'
              },
              {
                checked: false,
                id: 'ready',
                text: 'Ready',
                value: 'ready'
              },
              {
                checked: false,
                id: 'review',
                text: 'Review',
                value: 'review'
              },
              {
                checked: false,
                id: 'sent',
                text: 'Sent',
                value: 'sent'
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
