'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Things we need to stub
const FetchReviewChargeElementService = require('../../../../app/services/bill-runs/review/fetch-review-charge-element.service.js')

// Thing under test
const EditService = require('../../../../app/services/bill-runs/review/edit.service.js')

describe('Bill Runs Review - Edit Service', () => {
  const elementIndex = 1

  let reviewChargeElement

  beforeEach(() => {
    reviewChargeElement = BillRunsReviewFixture.reviewChargeElement()

    Sinon.stub(FetchReviewChargeElementService, 'go').resolves(reviewChargeElement)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await EditService.go(reviewChargeElement.id, elementIndex)

      expect(result).to.equal({
        pageTitle: 'Set the billable returns quantity for this bill run',
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
})
