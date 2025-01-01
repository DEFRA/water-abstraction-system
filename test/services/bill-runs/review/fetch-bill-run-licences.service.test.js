'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const { closeConnection } = require('../../../support/database.js')
const DatabaseConfig = require('../../../../config/database.config.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Thing under test
const FetchBillRunLicencesService = require('../../../../app/services/bill-runs/review/fetch-bill-run-licences.service.js')

describe('Bill Runs Review - Fetch Bill Run Licences service', () => {
  let filterIssues
  let filterLicenceHolderNumber
  let filterLicenceStatus
  let filterProgress
  let page
  let testLicenceReady
  let testLicenceReview
  let testLicenceNoIssues

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
  })

  describe('when there is a valid bill run', () => {
    let billRun
    let region

    beforeEach(async () => {
      region = RegionHelper.select()
      billRun = await BillRunHelper.add({ regionId: region.id, batchType: 'two_part_tariff' })

      testLicenceReady = await ReviewLicenceHelper.add({
        billRunId: billRun.id,
        licenceHolder: 'Ready Licence Holder Ltd',
        status: 'ready',
        progress: true,
        issues: 'Returns received late'
      })

      testLicenceReview = await ReviewLicenceHelper.add({
        billRunId: billRun.id,
        licenceRef: '02/200',
        licenceHolder: 'Review Licence Holder Ltd',
        status: 'review',
        issues: 'Over abstraction, Returns received but not processed'
      })
    })

    describe('and there are licences in the bill run that fit on a single page', () => {
      beforeEach(async () => {
        // no filters are being applied so these are undefined
        filterIssues = undefined
        filterLicenceHolderNumber = undefined
        filterLicenceStatus = undefined
        filterProgress = undefined

        page = undefined
        // Set the default page size to 2 so all 2 records fit on a single page
        Sinon.replace(DatabaseConfig, 'defaultPageSize', 2)
      })

      it('returns details of the bill run and the licences in it', async () => {
        const result = await FetchBillRunLicencesService.go(
          billRun.id,
          filterIssues,
          filterLicenceHolderNumber,
          filterLicenceStatus,
          filterProgress,
          page
        )

        expect(result.billRun.id).to.equal(billRun.id)
        expect(result.billRun.batchType).to.equal(billRun.batchType)
        expect(result.billRun.createdAt).to.equal(billRun.createdAt)
        expect(result.billRun.scheme).to.equal(billRun.scheme)
        expect(result.billRun.status).to.equal(billRun.status)
        expect(result.billRun.summer).to.equal(billRun.summer)
        expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
        expect(result.billRun.region.displayName).to.equal(region.displayName)
        expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
        expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

        expect(result.licences.total).to.equal(2)
        expect(result.licences.results).to.have.length(2)
        expect(result.licences.results[0].licenceId).to.equal(testLicenceReview.licenceId)
        expect(result.licences.results[0].licenceHolder).to.equal('Review Licence Holder Ltd')
        expect(result.licences.results[0].licenceRef).to.equal(testLicenceReview.licenceRef)
        expect(result.licences.results[0].issues).to.equal('Over abstraction, Returns received but not processed')
        expect(result.licences.results[0].status).to.equal('review')
        expect(result.licences.results[1].licenceId).to.equal(testLicenceReady.licenceId)
        expect(result.licences.results[1].licenceHolder).to.equal('Ready Licence Holder Ltd')
        expect(result.licences.results[1].licenceRef).to.equal(testLicenceReady.licenceRef)
        expect(result.licences.results[1].issues).to.equal('Returns received late')
        expect(result.licences.results[1].status).to.equal('ready')
      })

      it('orders the licence by "review status" first', async () => {
        const result = await FetchBillRunLicencesService.go(
          billRun.id,
          filterIssues,
          filterLicenceHolderNumber,
          filterLicenceStatus,
          filterProgress,
          page
        )

        expect(result.licences.results[0].status).to.equal('review')
        expect(result.licences.results[1].status).to.equal('ready')
      })

      describe('after its been ordered by the licence status', () => {
        beforeEach(async () => {
          await ReviewLicenceHelper.add({
            billRunId: billRun.id,
            licenceRef: '01/100',
            licenceHolder: 'Review Licence Holder Ltd',
            status: 'review',
            issues: 'Over abstraction, Returns received but not processed'
          })
        })

        it('orders the licences by licence ref', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterProgress,
            filterLicenceStatus,
            page
          )

          expect(result.licences.results[0].licenceRef).to.equal('01/100')
          expect(result.licences.results[1].licenceRef).to.equal('02/200')
        })
      })

      describe('and a filter has been applied to the licence holder', () => {
        beforeEach(() => {
          filterIssues = undefined
          filterLicenceHolderNumber = 'ready licence'
          filterLicenceStatus = undefined
          filterProgress = undefined
        })

        it('returns details of the bill run and the licences that match the filter', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.scheme).to.equal(billRun.scheme)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.summer).to.equal(billRun.summer)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(1)
          expect(result.licences.results).to.have.length(1)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceReady.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('Ready Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal(testLicenceReady.licenceRef)
          expect(result.licences.results[0].issues).to.equal('Returns received late')
          expect(result.licences.results[0].status).to.equal('ready')
        })
      })

      describe('and a filter has been applied to the licence number', () => {
        beforeEach(() => {
          filterIssues = undefined
          filterLicenceHolderNumber = '02/200'
          filterLicenceStatus = undefined
          filterProgress = undefined
        })

        it('returns details of the bill run and the licences that match the filter', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(1)
          expect(result.licences.results).to.have.length(1)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceReview.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('Review Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal('02/200')
          expect(result.licences.results[0].issues).to.equal('Over abstraction, Returns received but not processed')
          expect(result.licences.results[0].status).to.equal('review')
        })
      })

      describe('and a filter has been applied to the licence status', () => {
        beforeEach(() => {
          filterIssues = undefined
          filterLicenceHolderNumber = undefined
          filterLicenceStatus = 'review'
          filterProgress = undefined
        })

        it('returns details of the bill run and the licences that match the filter', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(1)
          expect(result.licences.results).to.have.length(1)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceReview.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('Review Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal(testLicenceReview.licenceRef)
          expect(result.licences.results[0].issues).to.equal('Over abstraction, Returns received but not processed')
          expect(result.licences.results[0].status).to.equal('review')
        })
      })

      describe('and a filter has been applied to the licence progress', () => {
        beforeEach(() => {
          filterIssues = undefined
          filterLicenceHolderNumber = undefined
          filterLicenceStatus = undefined
          filterProgress = true
        })

        it('returns details of the bill run and the licences that match the filter', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(1)
          expect(result.licences.results).to.have.length(1)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceReady.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('Ready Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal(testLicenceReady.licenceRef)
          expect(result.licences.results[0].issues).to.equal('Returns received late')
          expect(result.licences.results[0].status).to.equal('ready')
        })
      })

      describe('and a single filter has been applied to the licence issues', () => {
        beforeEach(() => {
          filterIssues = 'over-abstraction'
          filterLicenceHolderNumber = undefined
          filterLicenceStatus = undefined
          filterProgress = undefined
        })

        it('returns details of the bill run and the licences that match the filter', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(1)
          expect(result.licences.results).to.have.length(1)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceReview.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('Review Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal(testLicenceReview.licenceRef)
          expect(result.licences.results[0].issues).to.equal('Over abstraction, Returns received but not processed')
          expect(result.licences.results[0].status).to.equal('review')
        })
      })

      describe('and a "no issues" filter has been applied to the licence issues', () => {
        beforeEach(async () => {
          testLicenceNoIssues = await ReviewLicenceHelper.add({
            billRunId: billRun.id,
            licenceRef: '03/200',
            licenceHolder: 'No issues Licence Holder Ltd',
            status: 'ready',
            issues: ''
          })

          filterIssues = 'no-issues'
          filterLicenceHolderNumber = undefined
          filterLicenceStatus = undefined
          filterProgress = undefined
        })

        it('returns details of the bill run and the licences that match the filter', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(3)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(1)
          expect(result.licences.results).to.have.length(1)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceNoIssues.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('No issues Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal(testLicenceNoIssues.licenceRef)
          expect(result.licences.results[0].issues).to.equal('')
          expect(result.licences.results[0].status).to.equal('ready')
        })
      })

      describe('and multiple filters have been applied to the licence issues', () => {
        beforeEach(() => {
          filterIssues = ['abs-outside-period', 'returns-received-not-processed', 'returns-late']
          filterLicenceHolderNumber = undefined
          filterLicenceStatus = undefined
          filterProgress = undefined
        })

        it('returns details of the bill run and the licences that match the filter', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(2)
          expect(result.licences.results).to.have.length(2)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceReview.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('Review Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal(testLicenceReview.licenceRef)
          expect(result.licences.results[0].issues).to.equal('Over abstraction, Returns received but not processed')
          expect(result.licences.results[0].status).to.equal('review')
          expect(result.licences.results[1].licenceId).to.equal(testLicenceReady.licenceId)
          expect(result.licences.results[1].licenceHolder).to.equal('Ready Licence Holder Ltd')
          expect(result.licences.results[1].licenceRef).to.equal(testLicenceReady.licenceRef)
          expect(result.licences.results[1].issues).to.equal('Returns received late')
          expect(result.licences.results[1].status).to.equal('ready')
        })
      })

      describe('and filters have been applied that will return no results', () => {
        beforeEach(() => {
          filterIssues = undefined
          filterLicenceHolderNumber = 'ready licence'
          filterLicenceStatus = 'review'
          filterProgress = undefined
        })

        it('returns details of the bill run and no licences', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.results).to.have.length(0)
        })
      })
    })

    describe('and there are licences in the bill run that fit on two pages', () => {
      beforeEach(async () => {
        // no filters are being applied so these are undefined
        filterIssues = undefined
        filterLicenceHolderNumber = undefined
        filterLicenceStatus = undefined
        filterProgress = undefined

        // Set the default page size to 1 so the 2 records fit on 2 pages
        Sinon.replace(DatabaseConfig, 'defaultPageSize', 1)
      })

      describe('and the first page is selected', () => {
        beforeEach(async () => {
          page = undefined
        })

        it('returns details of the bill run and the first page of licences in it', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(2)
          expect(result.licences.results).to.have.length(1)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceReview.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('Review Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal(testLicenceReview.licenceRef)
          expect(result.licences.results[0].issues).to.equal('Over abstraction, Returns received but not processed')
          expect(result.licences.results[0].status).to.equal('review')
        })
      })

      describe('and the second page is selected', () => {
        beforeEach(async () => {
          page = 2
        })

        it('returns details of the bill run and the second page of licences in it', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(2)
          expect(result.licences.results).to.have.length(1)
          expect(result.licences.results[0].licenceId).to.equal(testLicenceReady.licenceId)
          expect(result.licences.results[0].licenceHolder).to.equal('Ready Licence Holder Ltd')
          expect(result.licences.results[0].licenceRef).to.equal(testLicenceReady.licenceRef)
          expect(result.licences.results[0].issues).to.equal('Returns received late')
          expect(result.licences.results[0].status).to.equal('ready')
        })
      })

      describe('and an invalid selection of a third page is selected', () => {
        beforeEach(async () => {
          page = 3
        })

        it('returns details of the bill run and the correct `licences.total` but no licences', async () => {
          const result = await FetchBillRunLicencesService.go(
            billRun.id,
            filterIssues,
            filterLicenceHolderNumber,
            filterLicenceStatus,
            filterProgress,
            page
          )

          expect(result.billRun.id).to.equal(billRun.id)
          expect(result.billRun.createdAt).to.equal(billRun.createdAt)
          expect(result.billRun.status).to.equal(billRun.status)
          expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
          expect(result.billRun.batchType).to.equal(billRun.batchType)
          expect(result.billRun.region.displayName).to.equal(region.displayName)
          expect(result.billRun.reviewLicences[0].totalNumberOfLicences).to.equal(2)
          expect(result.billRun.reviewLicences[0].numberOfLicencesToReview).to.equal(1)

          expect(result.licences.total).to.equal(2)
          expect(result.licences.results).to.have.length(0)
        })
      })
    })
  })

  describe('when there is an invalid bill run id passed to the service', () => {
    let invalidBillRunId

    beforeEach(() => {
      filterIssues = undefined
      filterLicenceHolderNumber = undefined
      filterLicenceStatus = undefined
      invalidBillRunId = '56db85ed-767f-4c83-8174-5ad9c80fd00d'
      page = undefined
      filterProgress = undefined
    })

    it('returns no results', async () => {
      const result = await FetchBillRunLicencesService.go(
        invalidBillRunId,
        filterIssues,
        filterLicenceHolderNumber,
        filterLicenceStatus,
        filterProgress,
        page
      )

      expect(result.billRun).to.be.undefined()
      expect(result.licences.total).to.equal(0)
      expect(result.licences.results).to.have.length(0)
    })
  })
})
