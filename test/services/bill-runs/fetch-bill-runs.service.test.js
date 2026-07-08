// Test framework dependencies

// Test helpers
import * as BillRunHelper from '../../support/helpers/bill-run.helper.js'
import DatabaseConfig from '../../../config/database.config.js'
import * as RegionHelper from '../../support/helpers/region.helper.js'

// Thing under test
import FetchBillRunsService from '../../../app/services/bill-runs/fetch-bill-runs.service.js'

describe('Fetch Bill Runs service', () => {
  const region = RegionHelper.select()

  let filters
  let page

  beforeEach(() => {
    filters = _noFiltersApplied()
    page = '1'

    // Set the default page size to 3 so we don't have to create loads of bill runs to test the service
    vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 3)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when there are bill runs', () => {
    beforeAll(async () => {
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
        const { results } = await FetchBillRunsService(filters, page)

        // Due to the number of other bill runs created by other tests we can't assert on the exact values.
        // Instead we just check that the object returned contains the properties we expect
        expect('id' in results[0]).toBe(true)
        expect('batchType' in results[0]).toBe(true)
        expect('billRunNumber' in results[0]).toBe(true)
        expect('createdAt' in results[0]).toBe(true)
        expect('netTotal' in results[0]).toBe(true)
        expect('scheme' in results[0]).toBe(true)
        expect('status' in results[0]).toBe(true)
        expect('summer' in results[0]).toBe(true)
        expect('numberOfBills' in results[0]).toBe(true)
        expect('region' in results[0]).toBe(true)
      })
    })

    describe('for the page selected', () => {
      it('returns a full page of 3 matching "results" and the correct "total"', async () => {
        const { results, total } = await FetchBillRunsService(filters, page)

        expect(results.length).toEqual(3)
        expect(total >= 5).toBe(true)
      })
    })

    describe('for the next page selected', () => {
      beforeEach(() => {
        page = '2'
      })

      it('returns a result with the matching "results" and the correct "total"', async () => {
        const { results, total } = await FetchBillRunsService(filters, page)

        expect(results.length >= 2).toBe(true)
        expect(total >= 5).toBe(true)
      })
    })

    describe('but not for the page selected', () => {
      beforeEach(() => {
        page = '500'
      })

      it('returns a result with no "results" but the correct "total"', async () => {
        const { results, total } = await FetchBillRunsService(filters, page)

        expect(results).toHaveLength(0)
        expect(total >= 5).toBe(true)
      })
    })

    describe('when filters are applied', () => {
      describe('and "Number" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.number = 123498767
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            // All returned results should match the filter
            expect(results[0].billRunNumber).toEqual(filters.number)
            expect(total).toEqual(1)
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.number = 99887766
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            expect(results).toHaveLength(0)
            expect(total).toEqual(0)
          })
        })
      })

      describe('and "Run type" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.runTypes = ['supplementary']
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            // All returned results should match the filter
            expect(results[0].batchType).toEqual('supplementary')
            expect(total >= 5).toBe(true)
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.runTypes = ['unmatched-batch-type']
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            expect(results).toHaveLength(0)
            expect(total).toEqual(0)
          })
        })
      })

      describe('and "Region" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.regions = [region.id]
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            // All returned results should match the filter
            expect(results[0].region).toEqual(region.displayName)
            expect(total >= 5).toBe(true)
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.regions = ['00000000-0000-0000-0000-000000000000']
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            expect(results).toHaveLength(0)
            expect(total).toEqual(0)
          })
        })
      })

      describe('and "Status" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.statuses = ['sent']
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            // All returned results should match the filter
            expect(results[0].status).toEqual('sent')
            expect(total >= 5).toBe(true)
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.statuses = ['unmatched-status']
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            expect(results).toHaveLength(0)
            expect(total).toEqual(0)
          })
        })
      })

      describe('and "Year created" has been set', () => {
        describe('and there are matching bill runs', () => {
          beforeEach(() => {
            filters.yearCreated = 2024
          })

          it('returns the matching bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            // All returned results should match the filter
            expect(new Date(results[0].createdAt).getFullYear()).toEqual(filters.yearCreated)
            expect(total >= 3).toBe(true)
          })
        })

        describe('and there are no matching bill runs', () => {
          beforeEach(() => {
            filters.yearCreated = 1000
          })

          it('returns no bill runs', async () => {
            const { results, total } = await FetchBillRunsService(filters, page)

            expect(results).toHaveLength(0)
            expect(total).toEqual(0)
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
