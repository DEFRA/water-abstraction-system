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
    const payload = undefined

    const presenterStubData = {
      preparedBillRun: 'bill run data',
      preparedLicences: 'licence data',
      filter: {
        licenceHolder: undefined,
        licenceStatus: undefined,
        openFilter: false
      }
    }

    beforeEach(() => {
      Sinon.stub(ReviewBillRunPresenter, 'go').returns(presenterStubData)
    })

    it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
      const result = await ReviewBillRunService.go(billRunId, payload)

      expect(result).to.equal(presenterStubData)

      expect(FetchBillRunLicencesService.go.called).to.be.true()
      expect(ReviewBillRunPresenter.go.called).to.be.true()
    })
  })

  describe('when called with a filter applied', () => {
    const payload = { filterLicenceHolder: 'A Licence Holder Ltd', filterLicenceStatus: 'review' }

    const presenterStubData = {
      preparedBillRun: 'bill run data',
      preparedLicences: 'licence data',
      filter: {
        licenceHolder: 'A Licence Holder Ltd',
        licenceStatus: 'review',
        openFilter: true
      }
    }

    beforeEach(() => {
      Sinon.stub(ReviewBillRunPresenter, 'go').returns(presenterStubData)
    })

    it('will fetch the data for the review page and return it once formatted by the presenter', async () => {
      const result = await ReviewBillRunService.go(billRunId, payload)

      expect(result).to.equal(presenterStubData)

      expect(FetchBillRunLicencesService.go.called).to.be.true()
      expect(ReviewBillRunPresenter.go.called).to.be.true()
    })
  })
})
