// Test helpers
import * as ChargeElementHelper from '../support/helpers/charge-element.helper.js'
import * as ReviewChargeElementHelper from '../support/helpers/review-charge-element.helper.js'
import * as ReviewChargeElementReturnHelper from '../support/helpers/review-charge-element-return.helper.js'
import * as ReviewChargeReferenceHelper from '../support/helpers/review-charge-reference.helper.js'
import * as ReviewReturnHelper from '../support/helpers/review-return.helper.js'
import ChargeElementModel from '../../app/models/charge-element.model.js'
import ReviewChargeElementReturnModel from '../../app/models/review-charge-element-return.model.js'
import ReviewChargeReferenceModel from '../../app/models/review-charge-reference.model.js'
import ReviewReturnModel from '../../app/models/review-return.model.js'

// Thing under test
import ReviewChargeElementModel from '../../app/models/review-charge-element.model.js'

describe('Review Charge Element model', () => {
  let testChargeElement
  let testRecord
  let testReviewChargeReference
  let testReviewChargeElementReturns
  let testReviewReturns

  beforeAll(async () => {
    testChargeElement = await ChargeElementHelper.add()
    testReviewChargeReference = await ReviewChargeReferenceHelper.add()

    testRecord = await ReviewChargeElementHelper.add({
      chargeElementId: testChargeElement.id,
      reviewChargeReferenceId: testReviewChargeReference.id
    })

    testReviewReturns = []
    testReviewChargeElementReturns = []
    for (let i = 0; i < 2; i++) {
      const testReviewReturn = await ReviewReturnHelper.add()

      testReviewReturns.push(testReviewReturn)

      const testReviewChargeElementReturn = await ReviewChargeElementReturnHelper.add({
        reviewChargeElementId: testRecord.id,
        reviewReturnId: testReviewReturn.id
      })

      testReviewChargeElementReturns.push(testReviewChargeElementReturn)
    }
  })

  afterAll(async () => {
    await testChargeElement.$query().delete()
    await testReviewChargeReference.$query().delete()

    for (const reviewReturn of testReviewReturns) {
      await reviewReturn.$query().delete()
    }

    for (const reviewChargeElementReturn of testReviewChargeElementReturns) {
      await reviewChargeElementReturn.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeElementModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReviewChargeElementModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to a charge element', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementModel.query().innerJoinRelated('chargeElement')

        expect(query).toBeDefined()
      })

      it('can eager load the charge element', async () => {
        const result = await ReviewChargeElementModel.query().findById(testRecord.id).withGraphFetched('chargeElement')

        expect(result).toBeInstanceOf(ReviewChargeElementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeElement).toBeInstanceOf(ChargeElementModel)
        expect(result.chargeElement).toEqual(testChargeElement)
      })
    })

    describe('when linking to review charge element returns', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementModel.query().innerJoinRelated('reviewChargeElementReturns')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge element returns', async () => {
        const result = await ReviewChargeElementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElementReturns')

        expect(result).toBeInstanceOf(ReviewChargeElementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeElementReturns).toBeInstanceOf(Array)
        expect(result.reviewChargeElementReturns[0]).toBeInstanceOf(ReviewChargeElementReturnModel)
        expect(result.reviewChargeElementReturns).toContainEqual(testReviewChargeElementReturns[0])
        expect(result.reviewChargeElementReturns).toContainEqual(testReviewChargeElementReturns[1])
      })
    })

    describe('when linking to review charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementModel.query().innerJoinRelated('reviewChargeReference')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge reference', async () => {
        const result = await ReviewChargeElementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeReference')

        expect(result).toBeInstanceOf(ReviewChargeElementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeReference).toBeInstanceOf(ReviewChargeReferenceModel)
        expect(result.reviewChargeReference).toEqual(testReviewChargeReference)
      })
    })

    describe('when linking to review returns', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementModel.query().innerJoinRelated('reviewReturns')

        expect(query).toBeDefined()
      })

      it('can eager load the review returns', async () => {
        const result = await ReviewChargeElementModel.query().findById(testRecord.id).withGraphFetched('reviewReturns')

        expect(result).toBeInstanceOf(ReviewChargeElementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewReturns).toBeInstanceOf(Array)
        expect(result.reviewReturns[0]).toBeInstanceOf(ReviewReturnModel)
        expect(result.reviewReturns).toContainEqual(testReviewReturns[0])
        expect(result.reviewReturns).toContainEqual(testReviewReturns[1])
      })
    })
  })
})
