'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Thing under test
const AuthorisedPresenter = require('../../../../app/presenters/bill-runs/review/authorised.presenter.js')

describe('Bill Runs Review - Authorised presenter', () => {
  let reviewChargeReference

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()
  })

  describe('when provided with the result of fetch review charge reference service', () => {
    it('correctly presents the data', () => {
      const result = AuthorisedPresenter.go(reviewChargeReference)

      expect(result).to.equal({
        amendedAuthorisedVolume: 9.092,
        chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
        chargePeriod: '1 April 2023 to 31 March 2024',
        financialPeriod: '2023 to 2024',
        reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
        totalBillableReturns: 0
      })
    })
  })
})
