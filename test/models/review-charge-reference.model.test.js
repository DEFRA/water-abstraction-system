// Test helpers
import * as ChargeReferenceHelper from '../support/helpers/charge-reference.helper.js'
import ChargeReferenceModel from '../../app/models/charge-reference.model.js'
import * as ReviewChargeElementHelper from '../support/helpers/review-charge-element.helper.js'
import ReviewChargeElementModel from '../../app/models/review-charge-element.model.js'
import * as ReviewChargeReferenceHelper from '../support/helpers/review-charge-reference.helper.js'
import * as ReviewChargeVersionHelper from '../support/helpers/review-charge-version.helper.js'
import ReviewChargeVersionModel from '../../app/models/review-charge-version.model.js'

// Thing under test
import ReviewChargeReferenceModel from '../../app/models/review-charge-reference.model.js'

describe('Review Charge reference model', () => {
  let testChargeElement
  let testChargeReference
  let testRecord
  let testReviewChargeVersion

  beforeAll(async () => {
    testChargeReference = await ChargeReferenceHelper.add()
    testReviewChargeVersion = await ReviewChargeVersionHelper.add()

    testRecord = await ReviewChargeReferenceHelper.add({
      chargeReferenceId: testChargeReference.id,
      reviewChargeVersionId: testReviewChargeVersion.id
    })

    testChargeElement = await ReviewChargeElementHelper.add({ reviewChargeReferenceId: testRecord.id })
  })

  afterAll(async () => {
    await testChargeReference.$query().delete()
    await testReviewChargeVersion.$query().delete()
    await testChargeElement.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeReferenceModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReviewChargeReferenceModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeReferenceModel.query().innerJoinRelated('chargeReference')

        expect(query).toBeDefined()
      })

      it('can eager load the charge reference', async () => {
        const result = await ReviewChargeReferenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeReference')

        expect(result).toBeInstanceOf(ReviewChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeReference).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReference).toEqual(testChargeReference)
      })
    })

    describe('when linking to review charge element', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeReferenceModel.query().innerJoinRelated('reviewChargeElements')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge element', async () => {
        const result = await ReviewChargeReferenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElements')

        expect(result).toBeInstanceOf(ReviewChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeElements).toBeInstanceOf(Array)
        expect(result.reviewChargeElements).toHaveLength(1)
        expect(result.reviewChargeElements[0]).toBeInstanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElements[0]).toEqual(testChargeElement)
      })
    })

    describe('when linking to review charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeReferenceModel.query().innerJoinRelated('reviewChargeVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge version', async () => {
        const result = await ReviewChargeReferenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeVersion')

        expect(result).toBeInstanceOf(ReviewChargeReferenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeVersion).toBeInstanceOf(ReviewChargeVersionModel)
        expect(result.reviewChargeVersion).toEqual(testReviewChargeVersion)
      })
    })
  })
})
