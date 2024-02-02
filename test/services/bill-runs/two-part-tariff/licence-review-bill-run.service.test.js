'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicenceReviewDataService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-licence-review-data.service.js')
const LicenceReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/licence-review-bill-run.presenter.js')
const PrepareLicenceReturnsService = require('../../../../app/services/bill-runs/two-part-tariff/prepare-licence-returns.service.js')

// Thing under test
const LicenceReviewBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/licence-review-bill-run.service.js')

describe('Licence Review Bill Run Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    const billRunId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
    const licenceId = '83fe31e7-2f16-4be7-b557-bbada2323d92'
    const status = 'review'

    beforeEach(() => {
      Sinon.stub(FetchLicenceReviewDataService, 'go').resolves({ returnLogs: 'return logs', licence: 'licence data', billRun: 'bill run data' })
      Sinon.stub(PrepareLicenceReturnsService, 'go').resolves({ matchedReturns: 'matching returns', unmatchedReturns: 'unmatched returns', chargePeriods: 'charge periods' })
      Sinon.stub(LicenceReviewBillRunPresenter, 'go').resolves('page data')
    })

    it('will fetch the licence charge data for the licence review page and return it once formatted by the presenter', async () => {
      const result = await LicenceReviewBillRunService.go(billRunId, licenceId, status)

      expect(result).to.equal('page data')
    })
  })

  describe('when a licence with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(LicenceReviewBillRunService.go('718c01a2-04bc-40f1-8e06-36c0ee50bb3a')).to.reject()
    })
  })
})
