'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const DatabaseConfig = require('../../../../config/database.config.js')
const FetchBillRunLicencesService = require('../../../../app/services/bill-runs/review/fetch-bill-run-licences.service.js')
// TODO: Stop stubbing the presenter
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/review/review-bill-run.presenter.js')

// Thing under test
const ReviewBillRunService = require('../../../../app/services/bill-runs/review/review-bill-run.service.js')

describe('Bill Runs Review - Review Bill Run Service', () => {
  const billRunId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  let page
  let yarStub

  beforeEach(() => {
    // The default page size is 25, but we set it here in case any local config is overriding the default
    Sinon.replace(DatabaseConfig, 'defaultPageSize', 25)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is only one page of results', () => {
    beforeEach(() => {
      page = undefined

      Sinon.stub(FetchBillRunLicencesService, 'go').resolves({
        billRun: 'bill data',
        licences: { results: 'licence data', total: 25 }
      })
    })

    describe('and the service is called without a filter applied', () => {
      const bannerMessage = undefined
      const presenterStubData = {
        preparedBillRun: 'bill run data',
        preparedLicences: 'licence data',
        filter: {
          issues: undefined,
          licenceHolder: undefined,
          licenceStatus: undefined,
          openFilter: false
        }
      }

      beforeEach(() => {
        Sinon.stub(ReviewBillRunPresenter, 'go').returns(presenterStubData)

        yarStub = { flash: Sinon.stub().returns([]), get: Sinon.stub().returns(undefined) }
      })

      it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
        const result = await ReviewBillRunService.go(billRunId, page, yarStub)

        expect(result.bannerMessage).to.equal(bannerMessage)
        expect(result.preparedBillRun).to.equal(presenterStubData.preparedBillRun)
        expect(result.preparedLicences).to.equal(presenterStubData.preparedLicences)
        expect(result.filter).to.equal(presenterStubData.filter)
        expect(result.pageTitle).to.equal('Review licences')
        expect(result.pagination.numberOfPages).to.equal(1)
        expect(result.pagination.component).not.to.exist()

        expect(FetchBillRunLicencesService.go.called).to.be.true()
        expect(ReviewBillRunPresenter.go.called).to.be.true()
      })
    })

    describe('and the service is called with a filter applied', () => {
      const bannerMessage = undefined
      const presenterStubData = {
        preparedBillRun: 'bill run data',
        preparedLicences: 'licence data',
        filter: {
          issues: {
            absOutsidePeriod: true,
            aggregateFactor: true,
            checkingQuery: false,
            noReturnsReceived: false,
            overAbstraction: false,
            overlapOfChargeDates: false,
            returnsReceivedNotProcessed: false,
            returnsLate: false,
            returnSplitOverRefs: false,
            someReturnsNotReceived: false,
            unableToMatchReturn: false
          },
          licenceHolder: 'A Licence Holder Ltd',
          licenceStatus: 'review',
          openFilter: true
        }
      }
      const yarGetStubData = {
        filterIssues: ['abs-outside-period', 'aggregate-factor'],
        filterLicenceHolderNumber: 'A Licence Holder Ltd',
        filterLicenceStatus: 'review'
      }

      beforeEach(() => {
        Sinon.stub(ReviewBillRunPresenter, 'go').returns(presenterStubData)

        yarStub = { flash: Sinon.stub().returns([]), get: Sinon.stub().returns(yarGetStubData) }
      })

      it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
        const result = await ReviewBillRunService.go(billRunId, page, yarStub)

        expect(result.bannerMessage).to.equal(bannerMessage)
        expect(result.preparedBillRun).to.equal(presenterStubData.preparedBillRun)
        expect(result.preparedLicences).to.equal(presenterStubData.preparedLicences)
        expect(result.filter).to.equal(presenterStubData.filter)
        expect(result.pageTitle).to.equal('Review licences')
        expect(result.pagination.numberOfPages).to.equal(1)
        expect(result.pagination.component).not.to.exist()

        expect(FetchBillRunLicencesService.go.called).to.be.true()
        expect(ReviewBillRunPresenter.go.called).to.be.true()
      })
    })

    describe('and the service is called with a banner displayed', () => {
      const bannerMessage = 'Licence 01/123/ABC removed from the bill run.'
      const presenterStubData = {
        preparedBillRun: 'bill run data',
        preparedLicences: 'licence data',
        filter: {
          issues: {
            absOutsidePeriod: true,
            aggregateFactor: true,
            checkingQuery: false,
            noReturnsReceived: false,
            overAbstraction: false,
            overlapOfChargeDates: false,
            returnsReceivedNotProcessed: false,
            returnsLate: false,
            returnSplitOverRefs: false,
            someReturnsNotReceived: false,
            unableToMatchReturn: false
          },
          licenceHolder: 'A Licence Holder Ltd',
          licenceStatus: 'review',
          openFilter: true
        }
      }
      const yarGetStubData = {
        filterIssues: ['abs-outside-period', 'aggregate-factor'],
        filterLicenceHolderNumber: 'A Licence Holder Ltd',
        filterLicenceStatus: 'review'
      }

      beforeEach(() => {
        Sinon.stub(ReviewBillRunPresenter, 'go').returns(presenterStubData)

        yarStub = {
          flash: Sinon.stub().returns(['Licence 01/123/ABC removed from the bill run.']),
          get: Sinon.stub().returns(yarGetStubData)
        }
      })

      it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
        const result = await ReviewBillRunService.go(billRunId, page, yarStub)

        expect(result.bannerMessage).to.equal(bannerMessage)
        expect(result.preparedBillRun).to.equal(presenterStubData.preparedBillRun)
        expect(result.preparedLicences).to.equal(presenterStubData.preparedLicences)
        expect(result.filter).to.equal(presenterStubData.filter)
        expect(result.pageTitle).to.equal('Review licences')
        expect(result.pagination.numberOfPages).to.equal(1)
        expect(result.pagination.component).not.to.exist()

        expect(FetchBillRunLicencesService.go.called).to.be.true()
        expect(ReviewBillRunPresenter.go.called).to.be.true()
      })
    })
  })

  describe('when there are multiple pages of results', () => {
    const bannerMessage = undefined
    const presenterStubData = {
      preparedBillRun: 'bill run data',
      preparedLicences: 'licence data',
      filter: {
        issues: undefined,
        licenceHolder: undefined,
        licenceStatus: undefined,
        openFilter: false
      }
    }

    beforeEach(() => {
      Sinon.stub(FetchBillRunLicencesService, 'go').resolves({
        billRun: 'bill data',
        licences: { results: 'licence data', total: 70 }
      })
      Sinon.stub(ReviewBillRunPresenter, 'go').returns(presenterStubData)

      yarStub = { flash: Sinon.stub().returns([]), get: Sinon.stub().returns(undefined) }
    })

    describe('and no page is selected', () => {
      beforeEach(() => {
        page = undefined
      })

      it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
        const result = await ReviewBillRunService.go(billRunId, page, yarStub)

        expect(result.bannerMessage).to.equal(bannerMessage)
        expect(result.preparedBillRun).to.equal(presenterStubData.preparedBillRun)
        expect(result.preparedLicences).to.equal(presenterStubData.preparedLicences)
        expect(result.filter).to.equal(presenterStubData.filter)
        expect(result.pageTitle).to.equal('Review licences (page 1 of 3)')
        expect(result.pagination.numberOfPages).to.equal(3)
        expect(result.pagination.component).to.exist()

        expect(FetchBillRunLicencesService.go.called).to.be.true()
        expect(ReviewBillRunPresenter.go.called).to.be.true()
      })
    })

    describe('and a page other than page 1 is selected', () => {
      beforeEach(() => {
        page = '2'
      })

      it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
        const result = await ReviewBillRunService.go(billRunId, page, yarStub)

        expect(result.bannerMessage).to.equal(bannerMessage)
        expect(result.preparedBillRun).to.equal(presenterStubData.preparedBillRun)
        expect(result.preparedLicences).to.equal(presenterStubData.preparedLicences)
        expect(result.filter).to.equal(presenterStubData.filter)
        expect(result.pageTitle).to.equal('Review licences (page 2 of 3)')
        expect(result.pagination.numberOfPages).to.equal(3)
        expect(result.pagination.component).to.exist()

        expect(FetchBillRunLicencesService.go.called).to.be.true()
        expect(ReviewBillRunPresenter.go.called).to.be.true()
      })
    })
  })

  describe('when there are no pages of results after a filter is applied', () => {
    const bannerMessage = undefined
    const presenterStubData = {
      preparedBillRun: 'bill run data',
      preparedLicences: 'licence data',
      filter: {
        issues: undefined,
        licenceHolder: 'Unknown Licence Holder',
        licenceStatus: undefined,
        openFilter: true
      }
    }
    const yarGetStubData = {
      filterIssues: undefined,
      filterLicenceHolderNumber: 'Unknown Licence Holder',
      filterLicenceStatus: undefined
    }

    beforeEach(() => {
      page = undefined

      Sinon.stub(FetchBillRunLicencesService, 'go').resolves({
        billRun: 'bill data',
        licences: { results: 'licence data', total: 0 }
      })

      Sinon.stub(ReviewBillRunPresenter, 'go').returns(presenterStubData)

      yarStub = { flash: Sinon.stub().returns([]), get: Sinon.stub().returns(yarGetStubData) }
    })

    it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
      const result = await ReviewBillRunService.go(billRunId, page, yarStub)

      expect(result.bannerMessage).to.equal(bannerMessage)
      expect(result.preparedBillRun).to.equal(presenterStubData.preparedBillRun)
      expect(result.preparedLicences).to.equal(presenterStubData.preparedLicences)
      expect(result.filter).to.equal(presenterStubData.filter)
      expect(result.pageTitle).to.equal('Review licences')
      expect(result.pagination.numberOfPages).to.equal(0)
      expect(result.pagination.component).not.to.exist()

      expect(FetchBillRunLicencesService.go.called).to.be.true()
      expect(ReviewBillRunPresenter.go.called).to.be.true()
    })
  })
})
