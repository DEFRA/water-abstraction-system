'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchBillRunLicencesService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-bill-run-licences.service.js')
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

// Thing under test
const ReviewBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/review-bill-run.service.js')

describe('Review Bill Run Service', () => {
  const billRunId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  let yarStub

  beforeEach(() => {
    Sinon.stub(FetchBillRunLicencesService, 'go').resolves({
      billRun: 'bill data',
      licences: 'licence data'
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called without a filter applied', () => {
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
      const result = await ReviewBillRunService.go(billRunId, yarStub)

      expect(result).to.equal({ bannerMessage, ...presenterStubData })

      expect(FetchBillRunLicencesService.go.called).to.be.true()
      expect(ReviewBillRunPresenter.go.called).to.be.true()
    })
  })

  describe('when called with a filter applied', () => {
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
      filterLicenceHolder: 'A Licence Holder Ltd',
      filterLicenceStatus: 'review'
    }

    beforeEach(() => {
      Sinon.stub(ReviewBillRunPresenter, 'go').returns(presenterStubData)

      yarStub = { flash: Sinon.stub().returns([]), get: Sinon.stub().returns(yarGetStubData) }
    })

    it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
      const result = await ReviewBillRunService.go(billRunId, yarStub)

      expect(result).to.equal({ bannerMessage, ...presenterStubData })

      expect(FetchBillRunLicencesService.go.called).to.be.true()
      expect(ReviewBillRunPresenter.go.called).to.be.true()
    })
  })

  describe('when called with a banner displayed', () => {
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
      filterLicenceHolder: 'A Licence Holder Ltd',
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
      const result = await ReviewBillRunService.go(billRunId, yarStub)

      expect(result).to.equal({ bannerMessage, ...presenterStubData })

      expect(FetchBillRunLicencesService.go.called).to.be.true()
      expect(ReviewBillRunPresenter.go.called).to.be.true()
    })
  })
})
