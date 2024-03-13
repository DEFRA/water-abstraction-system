'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicenceReviewDataService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-licence-results.service.js')
const ReviewLicencePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

// Thing under test
const ReviewLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/review-licence.service.js')

describe('Licence Review Bill Run Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a bill run id', () => {
    const billRunId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

    beforeEach(() => {
      Sinon.stub(FetchLicenceReviewDataService, 'go').resolves({ billRun: 'bill run data', licence: [{ licenceRef: '7/34/10/*S/0084' }] })
      Sinon.stub(ReviewLicencePresenter, 'go').resolves('page data')
    })

    it('will fetch the bill run data and return it once formatted by the presenter', async () => {
      const result = await ReviewLicenceService.go(billRunId)

      expect(result).to.equal('page data')
    })
  })
})
