// Test helpers
import ChargeElementHelper from '../support/helpers/charge-element.helper.js'
import ChargeReferenceHelper from '../support/helpers/charge-reference.helper.js'
import ChargeReferenceModel from '../../app/models/charge-reference.model.js'
import PurposeHelper from '../support/helpers/purpose.helper.js'
import PurposeModel from '../../app/models/purpose.model.js'
import ReviewChargeElementHelper from '../support/helpers/review-charge-element.helper.js'
import ReviewChargeElementModel from '../../app/models/review-charge-element.model.js'

// Thing under test
import ChargeElementModel from '../../app/models/charge-element.model.js'

describe('Charge Element model', () => {
  let testChargeReference
  let testRecord
  let testReviewChargeElements
  let testPurpose

  beforeAll(async () => {
    // Link charge reference
    testChargeReference = await ChargeReferenceHelper.add()

    // Link purpose
    testPurpose = PurposeHelper.select()

    // Test record
    testRecord = await ChargeElementHelper.add({ chargeReferenceId: testChargeReference.id, purposeId: testPurpose.id })

    // Link review charge elements
    testReviewChargeElements = []
    for (let i = 0; i < 2; i++) {
      const reviewChargeElement = await ReviewChargeElementHelper.add({ chargeElementId: testRecord.id })

      testReviewChargeElements.push(reviewChargeElement)
    }
  })

  afterAll(async () => {
    await testChargeReference.$query().delete()

    for (const reviewChargeElement of testReviewChargeElements) {
      await reviewChargeElement.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeElementModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ChargeElementModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query().innerJoinRelated('chargeReference')

        expect(query).toBeDefined()
      })

      it('can eager load the charge reference', async () => {
        const result = await ChargeElementModel.query().findById(testRecord.id).withGraphFetched('chargeReference')

        expect(result).toBeInstanceOf(ChargeElementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeReference).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReference).toEqual(testChargeReference)
      })
    })

    describe('when linking to purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query().innerJoinRelated('purpose')

        expect(query).toBeDefined()
      })

      it('can eager load the purposes use', async () => {
        const result = await ChargeElementModel.query().findById(testRecord.id).withGraphFetched('purpose')

        expect(result).toBeInstanceOf(ChargeElementModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.purpose).toBeInstanceOf(PurposeModel)
        expect(result.purpose).toMatchObject(testPurpose)
      })
    })

    describe('when linking to review charge elements', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query().innerJoinRelated('reviewChargeElements')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge elements', async () => {
        const result = await ChargeElementModel.query().findById(testRecord.id).withGraphFetched('reviewChargeElements')

        expect(result).toBeInstanceOf(ChargeElementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeElements).toBeInstanceOf(Array)
        expect(result.reviewChargeElements[0]).toBeInstanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElements).toContainEqual(testReviewChargeElements[0])
        expect(result.reviewChargeElements).toContainEqual(testReviewChargeElements[1])
      })
    })
  })
})
