'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
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
        adjustments: ['Aggregate factor (0.333333333)', 'Two part tariff agreement'],
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

  describe('the "adjustments" property', () => {
    beforeEach(() => {
      // Our fixture has these set by default. We set unset them so they don't interfere with the following tests
      reviewChargeReference.aggregate = 1
      reviewChargeReference.amendedAggregate = 1
      reviewChargeReference.twoPartTariffAgreement = false
    })

    describe('when the charge reference has an aggregate factor', () => {
      beforeEach(() => {
        reviewChargeReference.aggregate = 0.5
        reviewChargeReference.amendedAggregate = 0.5
      })

      it('adds the aggregate factor to the adjustments property', () => {
        const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

        expect(result.adjustments).to.equal(['Aggregate factor (0.5)'])
      })
    })

    describe('when the charge reference has a charge adjustment factor', () => {
      beforeEach(() => {
        reviewChargeReference.amendedChargeAdjustment = 0.7
        reviewChargeReference.chargeAdjustment = 0.7
      })

      it('adds the charge adjustment factor to the adjustments property', () => {
        const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

        expect(result.adjustments).to.equal(['Charge adjustment (0.7)'])
      })
    })

    describe('when the charge reference has a abatement agreement', () => {
      beforeEach(() => {
        reviewChargeReference.abatementAgreement = 0.3
      })

      it('adds the abatement agreement to the adjustments property', () => {
        const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

        expect(result.adjustments).to.equal(['Abatement agreement (0.3)'])
      })
    })

    describe('when the charge reference has a winter discount', () => {
      beforeEach(() => {
        reviewChargeReference.winterDiscount = true
      })

      it('adds the winter discount to the adjustments property', () => {
        const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

        expect(result.adjustments).to.equal(['Winter discount'])
      })
    })

    describe('when the charge reference has a two part tariff agreement', () => {
      beforeEach(() => {
        reviewChargeReference.twoPartTariffAgreement = true
      })

      it('adds the two part tariff agreement to the adjustments property', () => {
        const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

        expect(result.adjustments).to.equal(['Two part tariff agreement'])
      })
    })

    describe('when the charge reference has a canal and river trust agreement', () => {
      beforeEach(() => {
        reviewChargeReference.canalAndRiverTrustAgreement = true
      })

      it('adds the canal and river trust agreement to the adjustments property', () => {
        const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

        expect(result.adjustments).to.equal(['Canal and River trust agreement'])
      })
    })

    describe('when the charge reference has no adjustments', () => {
      it('sets the adjustments property as empty', () => {
        const result = ReviewChargeReferencePresenter.go(reviewChargeReference)

        expect(result.adjustments).to.equal([])
      })
    })
  })
})
