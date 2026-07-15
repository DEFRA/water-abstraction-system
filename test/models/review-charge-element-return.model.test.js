// Test helpers
import * as ReviewChargeElementHelper from '../support/helpers/review-charge-element.helper.js'
import * as ReviewChargeElementReturnHelper from '../support/helpers/review-charge-element-return.helper.js'
import * as ReviewReturnHelper from '../support/helpers/review-return.helper.js'
import ReviewChargeElementModel from '../../app/models/review-charge-element.model.js'
import ReviewReturnModel from '../../app/models/review-return.model.js'

// Thing under test
import ReviewChargeElementReturnModel from '../../app/models/review-charge-element-return.model.js'

describe('Review Charge Element Return model', () => {
  let testRecord
  let testReviewChargeElement
  let testReviewReturn

  beforeAll(async () => {
    testReviewChargeElement = await ReviewChargeElementHelper.add()
    testReviewReturn = await ReviewReturnHelper.add()

    testRecord = await ReviewChargeElementReturnHelper.add({
      reviewChargeElementId: testReviewChargeElement.id,
      reviewReturnId: testReviewReturn.id
    })
  })

  afterAll(async () => {
    await testReviewChargeElement.$query().delete()
    await testReviewReturn.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeElementReturnModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReviewChargeElementReturnModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to a review charge element', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementReturnModel.query().innerJoinRelated('reviewChargeElement')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge element', async () => {
        const result = await ReviewChargeElementReturnModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElement')

        expect(result).toBeInstanceOf(ReviewChargeElementReturnModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeElement).toBeInstanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElement).toEqual(testReviewChargeElement)
      })
    })

    describe('when linking to a review return', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementReturnModel.query().innerJoinRelated('reviewReturn')

        expect(query).toBeDefined()
      })

      it('can eager load the review return', async () => {
        const result = await ReviewChargeElementReturnModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewReturn')

        expect(result).toBeInstanceOf(ReviewChargeElementReturnModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewReturn).toBeInstanceOf(ReviewReturnModel)
        expect(result.reviewReturn).toEqual(testReviewReturn)
      })
    })
  })
})
