'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
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
        reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023'
      })
    })
  })

  describe('the "otherAdjustments" property', () => {
    beforeEach(() => {
      // Our fixture has this as true by default. We set it false so it doesn't interfere with the following tests
      reviewChargeReference.twoPartTariffAgreement = false
    })

    describe('when the charge reference has an abatement agreement', () => {
      beforeEach(() => {
        reviewChargeReference.abatementAgreement = 0.3
      })

      it('adds the abatement agreement to the otherAdjustments property', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Abatement agreement (0.3)'])
      })
    })

    describe('when the charge reference has a winter discount', () => {
      beforeEach(() => {
        reviewChargeReference.winterDiscount = true
      })

      it('adds the winter discount to the otherAdjustments property', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Winter discount'])
      })
    })

    describe('when the charge reference has a two part tariff agreement', () => {
      beforeEach(() => {
        reviewChargeReference.twoPartTariffAgreement = true
      })

      it('adds the two part tariff agreement to the otherAdjustments property', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Two part tariff agreement'])
      })
    })

    describe('when the charge reference has a canal and river trust agreement', () => {
      beforeEach(() => {
        reviewChargeReference.canalAndRiverTrustAgreement = true
      })

      it('adds the canal and river trust agreement to the otherAdjustments property', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Canal and River trust agreement'])
      })
    })

    describe('when the charge reference has a supported source', () => {
      beforeEach(() => {
        reviewChargeReference.chargeReference.supportedSourceName = 'Thames'
      })

      it('adds the supported source to the otherAdjustments property', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Supported source Thames'])
      })
    })

    describe('when the charge reference has a public water supply', () => {
      beforeEach(() => {
        reviewChargeReference.chargeReference.waterCompanyCharge = true
      })

      it('adds the public water supply to the otherAdjustments property', () => {
        const result = FactorsPresenter.go(reviewChargeReference)

        expect(result.otherAdjustments).to.equal(['Public Water Supply'])
      })
    })

    describe('when the charge reference has no other adjustments', () => {
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
