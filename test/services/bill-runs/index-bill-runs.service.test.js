'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CheckBusyBillRunsService = require('../../../app/services/bill-runs/check-busy-bill-runs.service.js')
const FetchBillRunsService = require('../../../app/services/bill-runs/fetch-bill-runs.service.js')
const FetchRegionsService = require('../../../app/services/bill-runs/setup/fetch-regions.service.js')

// Thing under test
const IndexBillRunsService = require('../../../app/services/bill-runs/index-bill-runs.service.js')

describe('Index Bill Runs service', () => {
  let page
  let yarStub

  beforeEach(() => {
    // It doesn't matter for these tests what busy state the service returns, only that it returns one.
    Sinon.stub(CheckBusyBillRunsService, 'go').resolves('none')
    Sinon.stub(FetchRegionsService, 'go').resolves([
      { id: '1d562e9a-2104-41d9-aa75-c008a7ec9059', displayName: 'Anglian' }
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is only one page of results', () => {
    beforeEach(() => {
      Sinon.stub(FetchBillRunsService, 'go').resolves({
        results: _fetchedBillRuns(),
        total: 2
      })

      yarStub = { get: Sinon.stub().returns(null) }
    })

    it('returns the page data for the view', async () => {
      const result = await IndexBillRunsService.go(yarStub, page)

      expect(result).to.equal({
        activeNavBar: 'bill-runs',
        filters: { number: null, regions: [], runTypes: [], yearCreated: null, openFilter: false },
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
        pagination: { numberOfPages: 1, showingMessage: 'Showing all 2 bill runs' }
      })
    })
  })

  describe('when there are multiple pages of results', () => {
    describe('and no page is selected', () => {
      beforeEach(() => {
        Sinon.stub(FetchBillRunsService, 'go').resolves({
          results: _fetchedBillRuns(),
          total: 70
        })
      })

      it('returns the page data for the view', async () => {
        const result = await IndexBillRunsService.go(yarStub, page)

        expect(result.billRuns).to.have.length(2)
        expect(result.filters.openFilter).to.be.false()
        expect(result.pageTitle).to.equal('Bill runs')
        expect(result.pagination.component).to.exist()
        expect(result.pagination.numberOfPages).to.equal(3) // 70 results with 25 per page = 3 pages
        expect(result.pagination.showingMessage).to.equal('Showing 2 of 70 bill runs')
      })
    })

    describe('and a page other than "page 1" with bill runs is selected', () => {
      beforeEach(() => {
        page = 2

        Sinon.stub(FetchBillRunsService, 'go').resolves({
          results: _fetchedBillRuns(),
          total: 70
        })
      })

      it('returns the page data for the view', async () => {
        const result = await IndexBillRunsService.go(yarStub, page)

        expect(result.billRuns).to.have.length(2)
        expect(result.filters.openFilter).to.be.false()
        expect(result.pageTitle).to.equal('Bill runs')
        expect(result.pagination.component).to.exist()
        expect(result.pagination.numberOfPages).to.equal(3) // 70 results with 25 per page = 3 pages
        expect(result.pagination.showingMessage).to.equal('Showing 2 of 70 bill runs')
      })
    })

    describe('and a page without bill runs is selected', () => {
      beforeEach(() => {
        page = 3

        Sinon.stub(FetchBillRunsService, 'go').resolves({
          results: [],
          total: 70
        })
      })

      it('returns the page data for the view', async () => {
        const result = await IndexBillRunsService.go(yarStub, page)

        expect(result.billRuns).to.be.empty()
        expect(result.filters.openFilter).to.be.false()
        expect(result.pageTitle).to.equal('Bill runs')
        expect(result.pagination.component).to.exist()
        expect(result.pagination.numberOfPages).to.equal(3) // 70 results with 25 per page = 3 pages
        expect(result.pagination.showingMessage).to.equal('Showing 0 of 70 bill runs')
      })
    })
  })

  describe('when the filters are assessed', () => {
    beforeEach(() => {
      // For the purposes of these tests the results don't matter
      Sinon.stub(FetchBillRunsService, 'go').resolves({ results: [], total: 0 })
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(null) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexBillRunsService.go(yarStub, page)

        expect(result.filters).to.equal({
          number: null,
          regions: [],
          runTypes: [],
          yearCreated: null,
          openFilter: false
        })
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(_billRunsFilter()) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexBillRunsService.go(yarStub, page)

        expect(result.filters).to.equal({
          number: null,
          regions: [],
          runTypes: [],
          yearCreated: null,
          openFilter: false
        })
      })
    })

    describe('when filters are applied', () => {
      beforeEach(() => {
        const filters = _billRunsFilter()

        filters.regions = '1d562e9a-2104-41d9-aa75-c008a7ec9059'
        filters.yearCreated = 2025

        yarStub = { get: Sinon.stub().returns(filters) }
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await IndexBillRunsService.go(yarStub, page)

        expect(result.filters).to.equal({
          number: null,
          regions: '1d562e9a-2104-41d9-aa75-c008a7ec9059',
          runTypes: [],
          yearCreated: 2025,
          openFilter: true
        })
      })
    })
  })
})

function _billRunsFilter() {
  return {
    number: null,
    regions: [],
    runTypes: [],
    yearCreated: null
  }
}

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
