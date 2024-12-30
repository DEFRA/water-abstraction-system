'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Things we need to stub
const FetchReviewChargeReferenceService = require('../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js')

// Thing under test
const FactorsService = require('../../../../app/services/bill-runs/review/factors.service.js')

describe('Bill Runs Review - Factors Service', () => {
  let reviewChargeReference

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    Sinon.stub(FetchReviewChargeReferenceService, 'go').resolves(reviewChargeReference)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await FactorsService.go(reviewChargeReference.id)

      expect(result).to.equal({
        pageTitle: 'Set the adjustment factors',
        amendedAggregate: 0.333333333,
        amendedChargeAdjustment: 1,
        chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
        chargePeriod: '1 April 2023 to 31 March 2024',
        financialPeriod: '2023 to 2024',
        otherAdjustments: ['Two part tariff agreement'],
        reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023'
      })
    })
  })
})
