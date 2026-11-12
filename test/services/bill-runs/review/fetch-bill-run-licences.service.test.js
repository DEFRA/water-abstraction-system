// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import DatabaseConfig from 'water-abstraction-engine/config/database.config.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import ReviewLicenceHelper from 'water-abstraction-engine/test/helpers/review-licence.helper.js'
import { today } from 'water-abstraction-engine/lib/general.lib.js'
import { generateRandomInteger } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import FetchBillRunLicencesService from '../../../../src/services/bill-runs/review/fetch-bill-run-licences.service.js'

describe('Bill Runs - Review - Fetch Bill Run Licences service', () => {
  const todaysDate = today()

  let filters
  let page
  let region
  let billRun
  let testLicenceReady
  let testLicenceReview
  let testLicenceNoIssues

  beforeAll(async () => {
    region = RegionHelper.select()

    billRun = await BillRunHelper.add({
      batchType: 'two_part_tariff',
      createdAt: todaysDate,
      regionId: region.id,
      status: 'review',
      toFinancialYearEnding: todaysDate.getFullYear()
    })

    testLicenceReady = await ReviewLicenceHelper.add({
      billRunId: billRun.id,
      issues: 'Returns received late',
      licenceHolder: 'Ready Licence Holder Ltd',
      licenceRef: `01/${generateRandomInteger(100, 9999)}`,
      progress: true,
      status: 'ready'
    })

    testLicenceReview = await ReviewLicenceHelper.add({
      billRunId: billRun.id,
      issues: 'Over abstraction, Returns received but not processed',
      licenceHolder: 'Review Licence Holder Ltd',
      licenceRef: `02/${generateRandomInteger(100, 9999)}`,
      status: 'review'
    })

    testLicenceNoIssues = await ReviewLicenceHelper.add({
      billRunId: billRun.id,
      issues: '',
      licenceHolder: 'No issues Licence Holder Ltd',
      licenceRef: `03/${generateRandomInteger(100, 9999)}`,
      status: 'ready'
    })
  })

  beforeEach(() => {
    // NOTE: _filters() generates an empty filters object as used by the services that call FetchBillRunLicencesService when no filter
    // has been applied by the user
    filters = _filters()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await testLicenceNoIssues.$query().delete()
    await testLicenceReview.$query().delete()
    await testLicenceReady.$query().delete()
    await billRun.$query().delete()
  })

  describe('when no filter is applied', () => {
    beforeEach(() => {
      // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
      // part of the full suite, and the risk our test record is returned in the second page of results.
      vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 1000)
    })

    it('returns details of the bill run and the licences in it', async () => {
      const result = await FetchBillRunLicencesService(billRun.id, filters, page)

      expect(result).toMatchObject({
        billRun: {
          batchType: 'two_part_tariff',
          createdAt: todaysDate,
          id: billRun.id,
          region: {
            displayName: region.displayName,
            id: region.id
          },
          reviewLicences: [
            {
              numberOfLicencesToReview: 1,
              totalNumberOfLicences: 3
            }
          ],
          scheme: 'sroc',
          status: 'review',
          summer: false,
          toFinancialYearEnding: todaysDate.getFullYear()
        },
        licences: {
          results: [
            {
              id: testLicenceReview.id,
              issues: 'Over abstraction, Returns received but not processed',
              licenceHolder: 'Review Licence Holder Ltd',
              licenceId: testLicenceReview.licenceId,
              licenceRef: testLicenceReview.licenceRef,
              progress: false,
              status: 'review'
            },
            {
              id: testLicenceReady.id,
              issues: 'Returns received late',
              licenceHolder: 'Ready Licence Holder Ltd',
              licenceId: testLicenceReady.licenceId,
              licenceRef: testLicenceReady.licenceRef,
              progress: true,
              status: 'ready'
            },
            {
              id: testLicenceNoIssues.id,
              issues: '',
              licenceHolder: 'No issues Licence Holder Ltd',
              licenceId: testLicenceNoIssues.licenceId,
              licenceRef: testLicenceNoIssues.licenceRef,
              progress: false,
              status: 'ready'
            }
          ],
          total: 3
        }
      })
    })
  })

  describe('when a filter is applied', () => {
    beforeEach(() => {
      vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 1000)
    })

    describe('and "Issues" has been set', () => {
      describe('to the "no-issues" issue', () => {
        beforeEach(() => {
          filters.issues.push('no-issues')
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService(billRun.id, filters, page)

          expect(result.licences).toMatchObject({
            results: [
              {
                id: testLicenceNoIssues.id,
                issues: '',
                licenceHolder: 'No issues Licence Holder Ltd',
                licenceId: testLicenceNoIssues.licenceId,
                licenceRef: testLicenceNoIssues.licenceRef,
                progress: false,
                status: 'ready'
              }
            ],
            total: 1
          })
        })
      })

      describe('with a single issue', () => {
        beforeEach(() => {
          filters.issues.push('returns-late')
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService(billRun.id, filters, page)

          expect(result.licences).toMatchObject({
            results: [
              {
                id: testLicenceReady.id,
                issues: 'Returns received late',
                licenceHolder: 'Ready Licence Holder Ltd',
                licenceId: testLicenceReady.licenceId,
                licenceRef: testLicenceReady.licenceRef,
                progress: true,
                status: 'ready'
              }
            ],
            total: 1
          })
        })
      })

      describe('with multiple issues', () => {
        beforeEach(() => {
          filters.issues.push('over-abstraction', 'returns-late')
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService(billRun.id, filters, page)

          expect(result.licences).toMatchObject({
            results: [
              {
                id: testLicenceReview.id,
                issues: 'Over abstraction, Returns received but not processed',
                licenceHolder: 'Review Licence Holder Ltd',
                licenceId: testLicenceReview.licenceId,
                licenceRef: testLicenceReview.licenceRef,
                progress: false,
                status: 'review'
              },
              {
                id: testLicenceReady.id,
                issues: 'Returns received late',
                licenceHolder: 'Ready Licence Holder Ltd',
                licenceId: testLicenceReady.licenceId,
                licenceRef: testLicenceReady.licenceRef,
                progress: true,
                status: 'ready'
              }
            ],
            total: 2
          })
        })
      })
    })

    describe('and "licenceHolderNumber" has been set', () => {
      describe('with part of a licence number', () => {
        beforeEach(() => {
          filters.licenceHolderNumber = '02/'
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService(billRun.id, filters, page)

          expect(result.licences).toMatchObject({
            results: [
              {
                id: testLicenceReview.id,
                issues: 'Over abstraction, Returns received but not processed',
                licenceHolder: 'Review Licence Holder Ltd',
                licenceId: testLicenceReview.licenceId,
                licenceRef: testLicenceReview.licenceRef,
                progress: false,
                status: 'review'
              }
            ],
            total: 1
          })
        })
      })

      describe('with part of a licence holder name', () => {
        beforeEach(() => {
          filters.licenceHolderNumber = 'ready'
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService(billRun.id, filters, page)

          expect(result.licences).toMatchObject({
            results: [
              {
                id: testLicenceReady.id,
                issues: 'Returns received late',
                licenceHolder: 'Ready Licence Holder Ltd',
                licenceId: testLicenceReady.licenceId,
                licenceRef: testLicenceReady.licenceRef,
                progress: true,
                status: 'ready'
              }
            ],
            total: 1
          })
        })
      })
    })

    describe('and "licenceStatus" has been set', () => {
      beforeEach(() => {
        filters.licenceStatus = 'review'
      })

      it('returns the matching licences', async () => {
        const result = await FetchBillRunLicencesService(billRun.id, filters, page)

        expect(result.licences).toMatchObject({
          results: [
            {
              id: testLicenceReview.id,
              issues: 'Over abstraction, Returns received but not processed',
              licenceHolder: 'Review Licence Holder Ltd',
              licenceId: testLicenceReview.licenceId,
              licenceRef: testLicenceReview.licenceRef,
              progress: false,
              status: 'review'
            }
          ],
          total: 1
        })
      })
    })

    describe('and "progress" has been set', () => {
      beforeEach(() => {
        filters.progress.push('inProgress')
      })

      it('returns the matching licences', async () => {
        const result = await FetchBillRunLicencesService(billRun.id, filters, page)

        expect(result.licences).toMatchObject({
          results: [
            {
              id: testLicenceReady.id,
              issues: 'Returns received late',
              licenceHolder: 'Ready Licence Holder Ltd',
              licenceId: testLicenceReady.licenceId,
              licenceRef: testLicenceReady.licenceRef,
              progress: true,
              status: 'ready'
            }
          ],
          total: 1
        })
      })
    })
  })

  describe('when the results are paginated', () => {
    beforeEach(() => {
      page = '2'

      // NOTE: We know we create 3 records so we set the value to 2 to ensure the results are paginated
      vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 2)
    })

    it('can return the selected page of licences', async () => {
      const result = await FetchBillRunLicencesService(billRun.id, filters, page)

      expect(result.licences.results).not.toHaveLength(0)
    })
  })
})

function _filters() {
  return {
    issues: [],
    licenceHolderNumber: null,
    licenceStatus: null,
    progress: []
  }
}
