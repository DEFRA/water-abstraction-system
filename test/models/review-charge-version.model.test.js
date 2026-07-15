// Test helpers
import * as ChargeVersionHelper from '../support/helpers/charge-version.helper.js'
import * as ReviewChargeReferenceHelper from '../support/helpers/review-charge-reference.helper.js'
import * as ReviewChargeVersionHelper from '../support/helpers/review-charge-version.helper.js'
import * as ReviewLicenceHelper from '../support/helpers/review-licence.helper.js'
import ChargeVersionModel from '../../app/models/charge-version.model.js'
import ReviewChargeReferenceModel from '../../app/models/review-charge-reference.model.js'
import ReviewLicenceModel from '../../app/models/review-licence.model.js'

// Thing under test
import ReviewChargeVersionModel from '../../app/models/review-charge-version.model.js'

describe('Review Charge Version model', () => {
  let testChargeReference
  let testChargeVersion
  let testRecord
  let testReviewLicence

  beforeAll(async () => {
    testChargeVersion = await ChargeVersionHelper.add()
    testReviewLicence = await ReviewLicenceHelper.add()

    testRecord = await ReviewChargeVersionHelper.add({
      chargeVersionId: testChargeVersion.id,
      reviewLicenceId: testReviewLicence.id
    })

    testChargeReference = await ReviewChargeReferenceHelper.add({ reviewChargeVersionId: testRecord.id })
  })

  afterAll(async () => {
    await testChargeVersion.$query().delete()
    await testReviewLicence.$query().delete()
    await testChargeReference.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeVersionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReviewChargeVersionModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeVersionModel.query().innerJoinRelated('chargeVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the charge version', async () => {
        const result = await ReviewChargeVersionModel.query().findById(testRecord.id).withGraphFetched('chargeVersion')

        expect(result).toBeInstanceOf(ReviewChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersion).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersion).toEqual(testChargeVersion)
      })
    })

    describe('when linking to review charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeVersionModel.query().innerJoinRelated('reviewChargeReferences')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge reference', async () => {
        const result = await ReviewChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeReferences')

        expect(result).toBeInstanceOf(ReviewChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeReferences).toBeInstanceOf(Array)
        expect(result.reviewChargeReferences).toHaveLength(1)
        expect(result.reviewChargeReferences[0]).toBeInstanceOf(ReviewChargeReferenceModel)
        expect(result.reviewChargeReferences[0]).toEqual(testChargeReference)
      })
    })

    describe('when linking to review licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeVersionModel.query().innerJoinRelated('reviewLicence')

        expect(query).toBeDefined()
      })

      it('can eager load the review licence', async () => {
        const result = await ReviewChargeVersionModel.query().findById(testRecord.id).withGraphFetched('reviewLicence')

        expect(result).toBeInstanceOf(ReviewChargeVersionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewLicence).toBeInstanceOf(ReviewLicenceModel)
        expect(result.reviewLicence).toEqual(testReviewLicence)
      })
    })
  })
})
