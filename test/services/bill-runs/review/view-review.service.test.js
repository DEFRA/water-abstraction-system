// Test helpers
import RegionHelper from '../../../support/helpers/region.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import DatabaseConfig from '../../../../config/database.config.js'
import * as FetchBillRunLicencesService from '../../../../app/services/bill-runs/review/fetch-bill-run-licences.service.js'

// Thing under test
import ViewReviewService from '../../../../app/services/bill-runs/review/view-review.service.js'

const billRunId = generateUUID()

describe('Bill Runs - Review - View Review Service', () => {
  let notification
  let fetchData
  let page
  let yarStub

  beforeEach(() => {
    // The default page size is 25, but we set it here in case any local config is overriding the default
    vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 25)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    beforeEach(() => {
      fetchData = {
        billRun: _fetchedBillRun(),
        licences: {
          results: [
            {
              id: generateUUID(),
              issues: 'Aggregate',
              licenceId: generateUUID(),
              licenceHolder: 'ACME Water PLC',
              licenceRef: LicenceHelper.generateLicenceRef(),
              progress: true,
              status: 'review'
            },
            {
              id: generateUUID(),
              issues: '',
              licenceId: generateUUID(),
              licenceHolder: 'SCEP Holdings Ltd',
              licenceRef: LicenceHelper.generateLicenceRef(),
              progress: false,
              status: 'ready'
            }
          ],
          total: 2
        }
      }

      vi.spyOn(FetchBillRunLicencesService, 'default').mockResolvedValue(fetchData)

      notification = {
        text: 'Licence 1/11/11/*11/1111 removed from the bill run.',
        titleText: 'Licence removed'
      }

      yarStub = YarStub()
      yarStub.flash.mockReturnValue([notification])
      yarStub.get.mockReturnValue(null)
    })

    it('returns the page data for the view', async () => {
      const result = await ViewReviewService(billRunId, yarStub, page)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        filters: {
          issues: [],
          licenceHolderNumber: null,
          licenceStatus: null,
          progress: [],
          openFilter: false
        },
        notification,
        backLink: { href: '/system/bill-runs', text: 'Go back to bill runs' },
        billRunId: fetchData.billRun.id,
        billRunType: 'Two-part tariff',
        chargeScheme: 'Current',
        dateCreated: '10 April 2025',
        financialYear: '2024 to 2025',
        licences: [
          {
            id: fetchData.licences.results[0].id,
            issue: 'Aggregate',
            licenceHolder: 'ACME Water PLC',
            licenceRef: fetchData.licences.results[0].licenceRef,
            progress: '✓',
            status: 'review'
          },
          {
            id: fetchData.licences.results[1].id,
            issue: '',
            licenceHolder: 'SCEP Holdings Ltd',
            licenceRef: fetchData.licences.results[1].licenceRef,
            progress: '',
            status: 'ready'
          }
        ],
        numberOfLicencesToReview: 1,
        pageTitle: 'Review licences',
        pageTitleCaption: `${fetchData.billRun.region.displayName} two-part tariff`,
        region: fetchData.billRun.region.displayName,
        reviewMessage:
          'You need to review 1 licence with returns data issues. You can then continue and send the bill run.',
        status: 'review',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 2 licences'
        }
      })
    })
  })

  describe('when the filters are assessed', () => {
    beforeEach(() => {
      // For the purposes of these tests the results don't matter
      fetchData = {
        billRun: _fetchedBillRun(),
        licences: { results: [], total: 0 }
      }

      vi.spyOn(FetchBillRunLicencesService, 'default').mockResolvedValue(fetchData)

      yarStub = YarStub()
      yarStub.flash.mockReturnValue([])
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub.get = vi.fn().mockReturnValue(null)
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await ViewReviewService(billRunId, yarStub, page)

        expect(result.filters.openFilter).toBe(false)
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub.get = vi.fn().mockReturnValue(_filters())
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await ViewReviewService(billRunId, yarStub, page)

        expect(result.filters.openFilter).toBe(false)
      })
    })

    describe('when a filter was applied', () => {
      beforeEach(() => {
        const filters = _filters()

        filters.licenceHolderNumber = 'carol shaw'
        yarStub.get = vi.fn().mockReturnValue(filters)
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await ViewReviewService(billRunId, yarStub, page)

        expect(result.filters.openFilter).toBe(true)
      })
    })
  })
})

function _fetchedBillRun() {
  const { id: regionId, displayName } = RegionHelper.select()

  return {
    id: billRunId,
    batchType: 'two_part_tariff',
    createdAt: new Date('2025-04-10T16:19:14.012Z'),
    scheme: 'sroc',
    status: 'review',
    summer: false,
    toFinancialYearEnding: 2025,
    region: {
      id: regionId,
      displayName
    },
    reviewLicences: [
      {
        totalNumberOfLicences: 2,
        numberOfLicencesToReview: 1
      }
    ]
  }
}

function _filters() {
  return {
    issues: null,
    licenceHolderNumber: null,
    licenceStatus: null,
    progress: null
  }
}
