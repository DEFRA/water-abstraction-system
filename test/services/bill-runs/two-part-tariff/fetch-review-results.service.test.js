'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const ReviewChargeElementsResultsHelper = require('../../..//support/helpers/review-charge-element-result.helper.js')
const ReviewResultsHelper = require('../../..//support/helpers/review-result.helper.js')
const ReviewReturnResultsHelper = require('../../../support/helpers/review-return-result.helper.js')

// Thing under test
const FetchReviewResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-results.service.js')

describe('Fetch Review Results Service', () => {
  const licenceId = '83fe31e7-2f16-4be7-b557-bbada2323d92'

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when the licence has data for review', () => {
    let reviewChargeElementsResults
    let reviewReturnResults
    let reviewResults

    describe('with related charge elements and returns', () => {
      beforeEach(async () => {
        reviewChargeElementsResults = await ReviewChargeElementsResultsHelper.add()
        reviewReturnResults = await ReviewReturnResultsHelper.add()
        reviewResults = await ReviewResultsHelper.add({
          licenceId,
          reviewChargeElementResultId: reviewChargeElementsResults.id,
          reviewReturnResultId: reviewReturnResults.id
        })
      })

      it('returns the review result with the related charge element and returns', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementResultId: reviewResults.reviewChargeElementResultId,
          chargeReferenceId: reviewResults.chargeReferenceId,
          reviewReturnResultId: reviewReturnResults.id,
          reviewChargeElementResults: {
            id: reviewChargeElementsResults.id,
            chargeDatesOverlap: reviewChargeElementsResults.chargeDatesOverlap,
            aggregate: reviewChargeElementsResults.aggregate
          },
          reviewReturnResults: {
            id: reviewReturnResults.id,
            underQuery: reviewReturnResults.underQuery,
            quantity: reviewReturnResults.quantity,
            allocated: reviewReturnResults.allocated,
            abstractionOutsidePeriod: reviewReturnResults.abstractionOutsidePeriod,
            status: reviewReturnResults.status,
            dueDate: reviewReturnResults.dueDate,
            receivedDate: reviewReturnResults.receivedDate
          }
        })
      })
    })

    describe('with related charge elements but no returns', () => {
      beforeEach(async () => {
        reviewChargeElementsResults = await ReviewChargeElementsResultsHelper.add()
        reviewResults = await ReviewResultsHelper.add({
          licenceId,
          reviewChargeElementResultId: reviewChargeElementsResults.id,
          reviewReturnResultId: null
        })
      })

      it('returns the review results with the related charge elements', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementResultId: reviewResults.reviewChargeElementResultId,
          chargeReferenceId: reviewResults.chargeReferenceId,
          reviewReturnResultId: reviewResults.reviewReturnResultId,
          reviewChargeElementResults: {
            id: reviewChargeElementsResults.id,
            chargeDatesOverlap: reviewChargeElementsResults.chargeDatesOverlap,
            aggregate: reviewChargeElementsResults.aggregate
          },
          reviewReturnResults: null
        })
      })
    })

    describe('with related returns but no charge elements', () => {
      beforeEach(async () => {
        reviewReturnResults = await ReviewReturnResultsHelper.add()

        reviewResults = await ReviewResultsHelper.add({
          licenceId,
          reviewChargeElementResultId: null,
          reviewReturnResultId: reviewReturnResults.id
        })
      })

      it('returns the review results with the related returns', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementResultId: reviewResults.reviewChargeElementResultId,
          chargeReferenceId: reviewResults.chargeReferenceId,
          reviewReturnResultId: reviewResults.reviewReturnResultId,
          reviewChargeElementResults: null,
          reviewReturnResults: {
            id: reviewReturnResults.id,
            underQuery: reviewReturnResults.underQuery,
            quantity: reviewReturnResults.quantity,
            allocated: reviewReturnResults.allocated,
            abstractionOutsidePeriod: reviewReturnResults.abstractionOutsidePeriod,
            status: reviewReturnResults.status,
            dueDate: reviewReturnResults.dueDate,
            receivedDate: reviewReturnResults.receivedDate
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
