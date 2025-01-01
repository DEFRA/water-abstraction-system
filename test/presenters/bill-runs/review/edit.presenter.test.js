'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Thing under test
const EditPresenter = require('../../../../app/presenters/bill-runs/review/edit.presenter.js')

describe('Bill Runs Review - Edit presenter', () => {
  const elementIndex = 1

  let reviewChargeElement

  beforeEach(() => {
    reviewChargeElement = BillRunsReviewFixture.reviewChargeElement()
  })

  describe('when provided with the result of fetch review charge element service', () => {
    it('correctly presents the data', () => {
      const result = EditPresenter.go(reviewChargeElement, elementIndex)

      expect(result).to.equal({
        authorisedQuantity: 9.092,
        billableReturns: 0,
        chargeDescription: 'Spray Irrigation - Direct',
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargePeriods: ['1 April 2023 to 30 September 2023'],
        elementIndex: 1,
        financialPeriod: '2023 to 2024',
        reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
      })
    })
  })

  describe('the "authorisedQuantity" property', () => {
    describe("when the linked review charge reference's authorised volume is less than the element's", () => {
      beforeEach(() => {
        reviewChargeElement.reviewChargeReference.amendedAuthorisedVolume = 5
      })

      it("returns the charge reference's lower authorised volume", () => {
        const result = EditPresenter.go(reviewChargeElement)

        expect(result.authorisedQuantity).to.equal(5)
      })
    })

    describe("when the linked review charge reference's authorised volume is greater than the element's", () => {
      beforeEach(() => {
        reviewChargeElement.reviewChargeReference.amendedAuthorisedVolume = 15
      })

      it("returns the charge element's lower authorised volume", () => {
        const result = EditPresenter.go(reviewChargeElement)

        expect(result.authorisedQuantity).to.equal(9.092)
      })
    })
  })
})
