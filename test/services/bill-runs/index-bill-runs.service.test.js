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

// Thing under test
const IndexBillRunsService = require('../../../app/services/bill-runs/index-bill-runs.service.js')

describe('Index Bill Runs service', () => {
  let page

  beforeEach(() => {
    // It doesn't matter for these tests what busy state the service returns, only that it returns one.
    Sinon.stub(CheckBusyBillRunsService, 'go').resolves('none')
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
    })

    it('returns the page data for the view', async () => {
      const result = await IndexBillRunsService.go(page)

      expect(result.billRuns).to.have.length(2)
      expect(result.pageTitle).to.equal('Bill runs')
      expect(result.pagination.component).not.to.exist()
      expect(result.pagination.numberOfPages).to.equal(1)
      expect(result.pagination.showingMessage).to.equal('Showing all 2 bill runs')
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
        const result = await IndexBillRunsService.go(page)

        expect(result.billRuns).to.have.length(2)
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
        const result = await IndexBillRunsService.go(page)

        expect(result.billRuns).to.have.length(2)
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
        const result = await IndexBillRunsService.go(page)

        expect(result.billRuns).to.be.empty()
        expect(result.pageTitle).to.equal('Bill runs')
        expect(result.pagination.component).to.exist()
        expect(result.pagination.numberOfPages).to.equal(3) // 70 results with 25 per page = 3 pages
        expect(result.pagination.showingMessage).to.equal('Showing 0 of 70 bill runs')
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
