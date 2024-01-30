'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ReviewResultsHelper = require('../../..//support/helpers/review-result.helper.js')
const ReviewChargeElementsResultsHelper = require('../../..//support/helpers/review-charge-element-result.helper.js')
const ReviewReturnResultsHelper = require('../../../support/helpers/review-return-result.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Thing under test
const FetchReviewResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-results.service.js')

describe('Fetch Review Results Service', () => {
  const licenceId = '83fe31e7-2f16-4be7-b557-bbada2323d92'

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are applicable review results', () => {
    const reviewChargeElementResultId = '00ef49b5-dfd1-44cb-948f-d4f62c91741f'
    const reviewReturnResultId = 'c4c7e681-9539-4bbb-a507-d019ff088218'
    const chargeReferenceId = 'a0e69d38-216d-4d52-b8d9-cb4b8c3f9688'

    describe('with related review charge element results and review return results', () => {
      beforeEach(async () => {
        await ReviewResultsHelper.add({ licenceId, reviewChargeElementResultId, reviewReturnResultId, chargeReferenceId })

        await ReviewChargeElementsResultsHelper.add({ id: reviewChargeElementResultId })

        await ReviewReturnResultsHelper.add({ id: reviewReturnResultId })
      })

      it('returns the review result with the related review charge element results and review return results', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementResultId: '00ef49b5-dfd1-44cb-948f-d4f62c91741f',
          chargeReferenceId: 'a0e69d38-216d-4d52-b8d9-cb4b8c3f9688',
          reviewReturnResultId: 'c4c7e681-9539-4bbb-a507-d019ff088218',
          reviewChargeElementResults: {
            id: '00ef49b5-dfd1-44cb-948f-d4f62c91741f',
            chargeDatesOverlap: false,
            aggregate: 1
          },
          reviewReturnResults: {
            id: 'c4c7e681-9539-4bbb-a507-d019ff088218',
            underQuery: false,
            quantity: 0,
            allocated: 0,
            abstractionOutsidePeriod: false,
            status: 'completed',
            dueDate: new Date('2022-06-03'),
            receivedDate: new Date('2022-06-03')
          }
        })
      })
    })

    describe('with related review charge element result but no review return results', () => {
      beforeEach(async () => {
        await ReviewResultsHelper.add({ licenceId, reviewChargeElementResultId, chargeReferenceId, reviewReturnResultId: null })

        await ReviewChargeElementsResultsHelper.add({ id: reviewChargeElementResultId })
      })

      it('returns the review result with the related review charge element results', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementResultId: '00ef49b5-dfd1-44cb-948f-d4f62c91741f',
          chargeReferenceId: 'a0e69d38-216d-4d52-b8d9-cb4b8c3f9688',
          reviewReturnResultId: null,
          reviewChargeElementResults: {
            id: '00ef49b5-dfd1-44cb-948f-d4f62c91741f',
            chargeDatesOverlap: false,
            aggregate: 1
          },
          reviewReturnResults: null
        })
      })
    })

    describe('with related review return result but no review charge element results', () => {
      beforeEach(async () => {
        await ReviewResultsHelper.add({ licenceId, reviewChargeElementResultId: null, reviewReturnResultId, chargeReferenceId })

        await ReviewReturnResultsHelper.add({ id: reviewReturnResultId })
      })

      it('returns the review result with the related review return results', async () => {
        const result = await FetchReviewResultsService.go(licenceId)

        expect(result[0]).to.equal({
          reviewChargeElementResultId: null,
          chargeReferenceId: 'a0e69d38-216d-4d52-b8d9-cb4b8c3f9688',
          reviewReturnResultId: 'c4c7e681-9539-4bbb-a507-d019ff088218',
          reviewChargeElementResults: null,
          reviewReturnResults: {
            id: 'c4c7e681-9539-4bbb-a507-d019ff088218',
            underQuery: false,
            quantity: 0,
            allocated: 0,
            abstractionOutsidePeriod: false,
            status: 'completed',
            dueDate: new Date('2022-06-03'),
            receivedDate: new Date('2022-06-03')
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
