'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const DetermineBillRunIssuesService = require('../../../../app/services/bill-runs/two-part-tariff/determine-bill-run-issues.service.js')
const FetchBillRunLicencesService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-bill-run-licences.service.js')
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

// Thing under test
const ReviewBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/review-bill-run.service.js')

describe('Review Bill Run Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    const billRunId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

    beforeEach(() => {
      Sinon.stub(FetchBillRunLicencesService, 'go').resolves({ billRun: 'bill data', billRunLicences: 'licence data' })
      Sinon.stub(DetermineBillRunIssuesService, 'go').resolves()
      Sinon.stub(ReviewBillRunPresenter, 'go').returns('page data')
    })

    it('will fetch the bill run data for the review page and return it once formatted by the presenter', async () => {
      const result = await ReviewBillRunService.go(billRunId)

      expect(result).to.equal('page data')

      expect(FetchBillRunLicencesService.go.called).to.be.true()
      expect(DetermineBillRunIssuesService.go.called).to.be.true()
      expect(ReviewBillRunPresenter.go.called).to.be.true()
    })
  })
})
