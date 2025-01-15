'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Thing under test
const FactorsPresenter = require('../../../../app/presenters/bill-runs/review/factors.presenter.js')

describe('Bill Runs Review - Factors presenter', () => {
  let reviewChargeReference

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()
  })

  describe('when provided with the result of fetch review charge reference service', () => {
    it('correctly presents the data', () => {
      const result = FactorsPresenter.go(reviewChargeReference)

      expect(result).to.equal({
        amendedAggregate: 0.333333333,
        amendedChargeAdjustment: 1,
        chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
        chargePeriod: '1 April 2023 to 31 March 2024',
        financialPeriod: '2023 to 2024',
        otherAdjustments: ['Two part tariff agreement'],
        pageTitle: 'Set the adjustment factors',
        reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023'
      })
    })
  })

  // NOTE: otherAdjustments combines the results of `formatAdditionalCharges()` and `formatAdjustments()` from
  // `base-review.presenter.js`. So, just to ensure the combining is working correctly we just test what we get back
  // when we have one of each, and one from each type
  describe('the "otherAdjustments" property', () => {
    beforeEach(() => {
      // Our fixture has this as true by default. We set it false so it doesn't interfere with the following tests
      reviewChargeReference.twoPartTariffAgreement = false
    })

    describe('when the charge reference has only an adjustment', () => {
      beforeEach(() => {
        reviewChargeReference.abatementAgreement = 0.3
      })

      it('the otherAdjustments property only contains the adjustment', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Abatement agreement (0.3)'])
      })
    })

    describe('when the charge reference has only an additional charge', () => {
      beforeEach(() => {
        reviewChargeReference.chargeReference.waterCompanyCharge = true
      })

      it('the otherAdjustments property only contains the additional charge', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Public Water Supply'])
      })
    })

    describe('when the charge reference has both an adjustment and an additional charge', () => {
      beforeEach(() => {
        reviewChargeReference.abatementAgreement = 0.3
        reviewChargeReference.chargeReference.waterCompanyCharge = true
      })

      it('the otherAdjustments property contains both', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Public Water Supply', 'Abatement agreement (0.3)'])
      })
    })

    describe('when the charge reference has no adjustments or additional charges', () => {
      beforeEach(() => {
        reviewChargeReference.twoPartTariffAgreement = false
      })

      it('sets the otherAdjustments property as empty', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal([])
      })
    })
  })
})
