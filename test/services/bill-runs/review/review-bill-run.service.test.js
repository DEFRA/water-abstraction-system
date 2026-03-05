'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const DatabaseConfig = require('../../../../config/database.config.js')
const FetchBillRunLicencesService = require('../../../../app/services/bill-runs/review/fetch-bill-run-licences.service.js')

// Thing under test
const ReviewBillRunService = require('../../../../app/services/bill-runs/review/review-bill-run.service.js')

const billRunId = generateUUID()

describe('Bill Runs - Review - Review Bill Run Service', () => {
  let bannerMessage
  let fetchData
  let page
  let yarStub

  beforeEach(() => {
    // The default page size is 25, but we set it here in case any local config is overriding the default
    Sinon.replace(DatabaseConfig, 'defaultPageSize', 25)
  })

  afterEach(() => {
    Sinon.restore()
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
              licenceRef: generateLicenceRef(),
              progress: true,
              status: 'review'
            },
            {
              id: generateUUID(),
              issues: '',
              licenceId: generateUUID(),
              licenceHolder: 'SCEP Holdings Ltd',
              licenceRef: generateLicenceRef(),
              progress: false,
              status: 'ready'
            }
          ],
          total: 2
        }
      }

      Sinon.stub(FetchBillRunLicencesService, 'go').resolves(fetchData)

      bannerMessage = `Licence ${generateLicenceRef()} removed from the bill run.`

      yarStub = {
        flash: Sinon.stub().returns([bannerMessage]),
        get: Sinon.stub().returns(null)
      }
    })

    it('returns the page data for the view', async () => {
      const result = await ReviewBillRunService.go(billRunId, yarStub, page)

      expect(result).to.equal({
        activeNavBar: 'bill-runs',
        bannerMessage,
        filters: {
          issues: [],
          licenceHolderNumber: null,
          licenceStatus: null,
          progress: [],
          openFilter: false
        },
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
        pageSubHeading: `${fetchData.billRun.region.displayName} two-part tariff`,
        pageTitle: 'Review licences',
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

      Sinon.stub(FetchBillRunLicencesService, 'go').resolves(fetchData)

      yarStub = { flash: Sinon.stub().returns([]) }
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub.get = Sinon.stub().returns(null)
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await ReviewBillRunService.go(billRunId, yarStub, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub.get = Sinon.stub().returns(_filters())
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await ReviewBillRunService.go(billRunId, yarStub, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('when a filter was applied', () => {
      beforeEach(() => {
        const filters = _filters()

        filters.licenceHolderNumber = 'carol shaw'
        yarStub.get = Sinon.stub().returns(filters)
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await ReviewBillRunService.go(billRunId, yarStub, page)

        expect(result.filters.openFilter).to.be.true()
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
