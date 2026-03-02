'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const DatabaseConfig = require('../../../config/database.config.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchBillRunsService = require('../../../app/services/bill-runs/fetch-bill-runs.service.js')

describe('Fetch Bill Runs service', () => {
  const region = RegionHelper.select()

  let filters
  let page

  beforeEach(() => {
    filters = _noFiltersApplied()
    page = 1

    // Set the default page size to 3 so we don't have to create loads of bill runs to test the service
    Sinon.replace(DatabaseConfig, 'defaultPageSize', 3)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are bill runs', () => {
    before(async () => {
      await Promise.all([
        _addBillRun(123498767, new Date('2024-03-01'), 10000, 1, 2, region.id),
        _addBillRun(1002, new Date('2023-01-01'), 20000, 3, 4, region.id),
        _addBillRun(1003, new Date('2024-01-01'), 30000, 5, 6, region.id),
        _addBillRun(1001, new Date('2022-10-01'), 30000, 7, 8, region.id),
        _addBillRun(1004, new Date('2024-02-01'), 30000, 9, 10, region.id)
      ])
    })

    describe('for the page selected', () => {
      it('returns a result with the correct properties', async () => {
        const { results } = await FetchBillRunsService.go(filters, page)

        // Due to the number of other bill runs created by other tests we can't assert on the exact values.
        // Instead we just check that the object returned contains the properties we expect
        expect('id' in results[0]).to.be.true()
        expect('batchType' in results[0]).to.be.true()
        expect('billRunNumber' in results[0]).to.be.true()
        expect('createdAt' in results[0]).to.be.true()
        expect('netTotal' in results[0]).to.be.true()
        expect('scheme' in results[0]).to.be.true()
        expect('status' in results[0]).to.be.true()
        expect('summer' in results[0]).to.be.true()
        expect('numberOfBills' in results[0]).to.be.true()
        expect('region' in results[0]).to.be.true()
      })
    })

    describe('for the page selected', () => {
      it('returns a full page of 3 matching "results" and the correct "total"', async () => {
        const { results, total } = await FetchBillRunsService.go(filters, page)

        expect(results.length).to.equal(3)
        expect(total >= 5).to.be.true()
      })
    })

    describe('for the next page selected', () => {
      beforeEach(() => {
        page = 2
      })

      it('returns a result with the matching "results" and the correct "total"', async () => {
        const { results, total } = await FetchBillRunsService.go(filters, page)

        expect(results.length >= 2).to.be.true()
        expect(total >= 5).to.be.true()
      })
    })

    describe('but not for the page selected', () => {
      beforeEach(() => {
        page = 500
      })

      it('returns a result with no "results" but the correct "total"', async () => {
        const { results, total } = await FetchBillRunsService.go(filters, page)

        expect(results).to.be.empty()
        expect(total >= 5).to.be.true()
      })
    })

    describe('when filters are applied', () => {
      describe('and "Number" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.number = 123498767
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            // All returned results should match the filter
            expect(results[0].billRunNumber).to.equal(filters.number)
            expect(total).to.equal(1)
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.number = 99887766
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            expect(results).to.be.empty()
            expect(total).to.equal(0)
          })
        })
      })

      describe('and "Run type" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.runTypes = ['supplementary']
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            // All returned results should match the filter
            expect(results[0].batchType).to.equal('supplementary')
            expect(total >= 5).to.be.true()
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.runTypes = ['unmatched-batch-type']
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            expect(results).to.be.empty()
            expect(total).to.equal(0)
          })
        })
      })

      describe('and "Region" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.regions = [region.id]
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            // All returned results should match the filter
            expect(results[0].region).to.equal(region.displayName)
            expect(total >= 5).to.be.true()
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.regions = ['00000000-0000-0000-0000-000000000000']
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            expect(results).to.be.empty()
            expect(total).to.equal(0)
          })
        })
      })

      describe('and "Status" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.statuses = ['sent']
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            // All returned results should match the filter
            expect(results[0].status).to.equal('sent')
            expect(total >= 5).to.be.true()
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.statuses = ['unmatched-status']
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            expect(results).to.be.empty()
            expect(total).to.equal(0)
          })
        })
      })

      describe('and "Year created" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.yearCreated = 2024
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            // All returned results should match the filter
            expect(new Date(results[0].createdAt).getFullYear()).to.equal(filters.yearCreated)
            expect(total >= 3).to.be.true()
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.yearCreated = 1000
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService.go(filters, page)

            expect(results).to.be.empty()
            expect(total).to.equal(0)
          })
        })
      })
    })
  })
})

function _addBillRun(billRunNumber, createdAt, netTotal, creditNoteCount, invoiceCount, regionId) {
  return BillRunHelper.add({
    billRunNumber,
    createdAt,
    netTotal,
    creditNoteCount,
    invoiceCount,
    regionId,
    status: 'sent'
  })
}

function _noFiltersApplied() {
  return { openFilter: false, regions: [], runTypes: [], statuses: [], yearCreated: null }
}
