'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const ReviewChargeElementsHelper = require('../../..//support/helpers/review-charge-element.helper.js')
const ReviewResultsHelper = require('../../..//support/helpers/review-result.helper.js')
const ReviewReturnsHelper = require('../../../support/helpers/review-return.helper.js')

// Thing under test
const FetchReviewResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-results.service.js')

describe('Fetch Review Results Service', () => {
  const licenceId = '83fe31e7-2f16-4be7-b557-bbada2323d92'

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when the licence has data for review', () => {
    let reviewChargeElements
    let reviewReturns
    let reviewResults

    describe('with related charge elements and returns', () => {
      beforeEach(async () => {
        reviewChargeElements = await ReviewChargeElementsHelper.add()
        reviewReturns = await ReviewReturnsHelper.add()
        reviewResults = await ReviewResultsHelper.add({
          licenceId,
          reviewChargeElementId: reviewChargeElements.id,
          reviewReturnId: reviewReturns.id
        })
      })

      it('returns the review result with the related charge element and returns', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementId: reviewResults.reviewChargeElementId,
          chargeReferenceId: reviewResults.chargeReferenceId,
          reviewReturnId: reviewReturns.id,
          reviewChargeElements: {
            id: reviewChargeElements.id,
            chargeDatesOverlap: reviewChargeElements.chargeDatesOverlap,
            aggregate: reviewChargeElements.aggregate
          },
          reviewReturns: {
            id: reviewReturns.id,
            underQuery: reviewReturns.underQuery,
            quantity: reviewReturns.quantity,
            allocated: reviewReturns.allocated,
            abstractionOutsidePeriod: reviewReturns.abstractionOutsidePeriod,
            status: reviewReturns.status,
            dueDate: reviewReturns.dueDate,
            receivedDate: reviewReturns.receivedDate
          }
        })
      })
    })

    describe('with related charge elements but no returns', () => {
      beforeEach(async () => {
        reviewChargeElements = await ReviewChargeElementsHelper.add()
        reviewResults = await ReviewResultsHelper.add({
          licenceId,
          reviewChargeElementId: reviewChargeElements.id,
          reviewReturnId: null
        })
      })

      it('returns the review results with the related charge elements', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementId: reviewResults.reviewChargeElementId,
          chargeReferenceId: reviewResults.chargeReferenceId,
          reviewReturnId: reviewResults.reviewReturnId,
          reviewChargeElements: {
            id: reviewChargeElements.id,
            chargeDatesOverlap: reviewChargeElements.chargeDatesOverlap,
            aggregate: reviewChargeElements.aggregate
          },
          reviewReturns: null
        })
      })
    })

    describe('with related returns but no charge elements', () => {
      beforeEach(async () => {
        reviewReturns = await ReviewReturnsHelper.add()

        reviewResults = await ReviewResultsHelper.add({
          licenceId,
          reviewChargeElementId: null,
          reviewReturnId: reviewReturns.id
        })
      })

      it('returns the review results with the related returns', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementId: reviewResults.reviewChargeElementId,
          chargeReferenceId: reviewResults.chargeReferenceId,
          reviewReturnId: reviewResults.reviewReturnId,
          reviewChargeElements: null,
          reviewReturns: {
            id: reviewReturns.id,
            underQuery: reviewReturns.underQuery,
            quantity: reviewReturns.quantity,
            allocated: reviewReturns.allocated,
            abstractionOutsidePeriod: reviewReturns.abstractionOutsidePeriod,
            status: reviewReturns.status,
            dueDate: reviewReturns.dueDate,
            receivedDate: reviewReturns.receivedDate
          }
        })
      })
    })
  })

  describe('when there are no applicable review results', () => {
    it('returns no records', async () => {
      const result = await FetchReviewResultsService.go(licenceId)

      expect(result).to.be.empty()
    })
  })
})
