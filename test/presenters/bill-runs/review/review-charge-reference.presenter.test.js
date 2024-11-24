'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Thing under test
const ReviewChargeReferencePresenter = require('../../../../app/presenters/bill-runs/review/review-charge-reference.presenter.js')

describe('Bill Runs Review - Review Charge Reference presenter', () => {
  let reviewChargeReference

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()
  })

  describe('when provided with the result of fetch review charge reference service', () => {
    it('correctly presents the data', () => {
      const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

      expect(result).to.equal({
        additionalCharges: '',
        adjustments: [
          'Aggregate factor (0.333333333 / 0.333333333)',
          'Charge adjustment (1 / 1)',
          'Two part tariff agreement'
        ],
        amendedAuthorisedVolume: 9.092,
        canAmend: true,
        chargeCategory: '4.6.5',
        chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
        chargePeriod: '1 April 2023 to 31 March 2024',
        financialPeriod: '2023 to 2024',
        reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
        reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
        totalBillableReturns: 0
      })
    })
  })

  // NOTE: adjustments combines the results of an internal `_factors()` method and `formatAdjustments()` from
  // `base-review.presenter.js`. So, the tests focus on ensuring `_factors()` is working and combining as expected with
  // the result of `formatAdjustments()`.
  describe('the "adjustments" property', () => {
    beforeEach(() => {
      // Our fixture has these set by default. We set unset them so they don't interfere with the following tests
      reviewChargeReference.aggregate = 1
      reviewChargeReference.amendedAggregate = 1
      reviewChargeReference.twoPartTariffAgreement = false
    })

    // NOTE: A value other than 1 or false means the charge reference has the 'adjustment'
    describe('when the user can change the factors', () => {
      describe('because the aggregate factor is not 1', () => {
        beforeEach(() => {
          reviewChargeReference.aggregate = 0.5
          reviewChargeReference.amendedAggregate = 0.6
        })

        it('adds it to the ""adjustments" property and displays both amended and original values', () => {
          const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

          expect(result.adjustments).to.equal(['Aggregate factor (0.6 / 0.5)', 'Charge adjustment (1 / 1)'])
        })
      })

      describe('because the charge adjustment factor is not 1', () => {
        beforeEach(() => {
          reviewChargeReference.amendedChargeAdjustment = 0.8
          reviewChargeReference.chargeAdjustment = 0.7
        })

        it('adds it to the ""adjustments" property and displays both amended and original values', () => {
          const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

          expect(result.adjustments).to.equal(['Aggregate factor (1 / 1)', 'Charge adjustment (0.8 / 0.7)'])
        })
      })

      describe('and there is also an adjustment', () => {
        beforeEach(() => {
          reviewChargeReference.aggregate = 0.9
          reviewChargeReference.amendedAggregate = 0.9
          reviewChargeReference.twoPartTariffAgreement = true
        })

        it('adds it to the ""adjustments" property along with the factors', () => {
          const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

          expect(result.adjustments).to.equal([
            'Aggregate factor (0.9 / 0.9)',
            'Charge adjustment (1 / 1)',
            'Two part tariff agreement'
          ])
        })
      })
    })

    describe('when the user cannot change the factors', () => {
      describe('because both the aggregate and charge adjustment factors are 1', () => {
        beforeEach(() => {
          reviewChargeReference.aggregate = 1
          reviewChargeReference.amendedAggregate = 1
          reviewChargeReference.amendedChargeAdjustment = 1
          reviewChargeReference.chargeAdjustment = 1
        })

        it('does not add either factor to "adjustments"', () => {
          const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

          expect(result.adjustments).to.not.include('Aggregate factor (1)')
          expect(result.adjustments).to.not.include('Charge adjustment (1)')
        })
      })

      describe('but there is an adjustment', () => {
        beforeEach(() => {
          reviewChargeReference.aggregate = 1
          reviewChargeReference.amendedAggregate = 1
          reviewChargeReference.twoPartTariffAgreement = true
        })

        it('adds just the adjustment to the ""adjustments" property', () => {
          const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

          expect(result.adjustments).to.equal(['Two part tariff agreement'])
        })
      })
    })
  })
})
