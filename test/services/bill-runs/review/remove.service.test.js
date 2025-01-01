'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Things we need to stub
const FetchRemoveReviewLicenceService = require('../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js')

// Thing under test
const RemoveService = require('../../../../app/services/bill-runs/review/remove.service.js')

describe('Bill Runs Review - Remove service', () => {
  let removeReviewLicence

  beforeEach(() => {
    removeReviewLicence = BillRunsReviewFixture.removeReviewLicence()

    Sinon.stub(FetchRemoveReviewLicenceService, 'go').resolves(removeReviewLicence)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RemoveService.go(removeReviewLicence.id)

      expect(result).to.equal({
        billRunNumber: 10001,
        billRunStatus: 'review',
        dateCreated: '22 October 2024',
        financialYearPeriod: '2023 to 2024',
        pageTitle: "You're about to remove 1/11/11/*11/1111 from the bill run",
        region: 'Test Region',
        reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763'
      })
    })
  })
})
