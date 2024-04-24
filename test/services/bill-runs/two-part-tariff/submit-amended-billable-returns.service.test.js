'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../../../app/models/review-charge-element.model.js')

// Thing under test
const SubmitAmendedBillableReturnsService = require('../../../../app/services/bill-runs/two-part-tariff/submit-amended-billable-returns.service.js')

describe('Submit Amended Billable Returns Service', () => {
  const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
  const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'
  let payload
  let reviewChargeElement

  beforeEach(async () => {
    await DatabaseSupport.clean()

    reviewChargeElement = await ReviewChargeElementHelper.add()
  })

  describe('when called', () => {
    describe('with a valid payload for quantityOptions', () => {
      beforeEach(async () => {
        payload = {
          'quantity-options': 10
        }
      })

      it('saves the submitted option', async () => {
        await SubmitAmendedBillableReturnsService.go(billRunId, licenceId, reviewChargeElement.id, payload)

        const reviewChargeElementData = await _fetchReviewChargeElement(reviewChargeElement.id)

        expect(reviewChargeElementData.allocated).to.equal(10)
      })
    })

    describe('with a valid payload for customQuantity', () => {
      beforeEach(async () => {
        payload = {
          'quantity-options': 'customQuantity',
          customQuantity: 20
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAmendedBillableReturnsService.go(billRunId, licenceId, reviewChargeElement.id, payload)

        const reviewChargeElementData = await _fetchReviewChargeElement(reviewChargeElement.id)

        expect(reviewChargeElementData.allocated).to.equal(20)
      })
    })
  })
})

async function _fetchReviewChargeElement (id) {
  return ReviewChargeElementModel.query()
    .findById(id)
}
