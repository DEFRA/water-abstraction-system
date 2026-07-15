// Test helpers
import BillRunHelper from '../support/helpers/bill-run.helper.js'
import BillRunModel from '../../app/models/bill-run.model.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import ReviewChargeVersionHelper from '../support/helpers/review-charge-version.helper.js'
import ReviewChargeVersionModel from '../../app/models/review-charge-version.model.js'
import ReviewLicenceHelper from '../support/helpers/review-licence.helper.js'
import ReviewReturnHelper from '../support/helpers/review-return.helper.js'
import ReviewReturnModel from '../../app/models/review-return.model.js'

// Thing under test
import ReviewLicenceModel from '../../app/models/review-licence.model.js'

describe('Review Licence model', () => {
  let testBillRun
  let testLicence
  let testRecord
  let testReviewChargeVersions
  let testReviewReturns

  beforeAll(async () => {
    testBillRun = await BillRunHelper.add()
    testLicence = await LicenceHelper.add()

    testRecord = await ReviewLicenceHelper.add({ billRunId: testBillRun.id, licenceId: testLicence.id })

    testReviewChargeVersions = []
    for (let i = 0; i < 2; i++) {
      const reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId: testRecord.id })

      testReviewChargeVersions.push(reviewChargeVersion)
    }

    testReviewReturns = []
    for (let i = 0; i < 2; i++) {
      const reviewReturn = await ReviewReturnHelper.add({ reviewLicenceId: testRecord.id })

      testReviewReturns.push(reviewReturn)
    }
  })

  afterAll(async () => {
    await testBillRun.$query().delete()
    await testLicence.$query().delete()

    for (const reviewChargeVersion of testReviewChargeVersions) {
      await reviewChargeVersion.$query().delete()
    }

    for (const reviewReturn of testReviewReturns) {
      await reviewReturn.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewLicenceModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReviewLicenceModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to a bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query().innerJoinRelated('billRun')

        expect(query).toBeDefined()
      })

      it('can eager load the bill run', async () => {
        const result = await ReviewLicenceModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).toBeInstanceOf(ReviewLicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRun).toBeInstanceOf(BillRunModel)
        expect(result.billRun).toEqual(testBillRun)
      })
    })

    describe('when linking to a licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await ReviewLicenceModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(ReviewLicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to review charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query().innerJoinRelated('reviewChargeVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge version', async () => {
        const result = await ReviewLicenceModel.query().findById(testRecord.id).withGraphFetched('reviewChargeVersions')

        expect(result).toBeInstanceOf(ReviewLicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeVersions).toBeInstanceOf(Array)
        expect(result.reviewChargeVersions[0]).toBeInstanceOf(ReviewChargeVersionModel)
        expect(result.reviewChargeVersions).toContainEqual(testReviewChargeVersions[0])
        expect(result.reviewChargeVersions).toContainEqual(testReviewChargeVersions[1])
      })
    })

    describe('when linking to review returns', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query().innerJoinRelated('reviewReturns')

        expect(query).toBeDefined()
      })

      it('can eager load the review returns', async () => {
        const result = await ReviewLicenceModel.query().findById(testRecord.id).withGraphFetched('reviewReturns')

        expect(result).toBeInstanceOf(ReviewLicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewReturns).toBeInstanceOf(Array)
        expect(result.reviewReturns[0]).toBeInstanceOf(ReviewReturnModel)
        expect(result.reviewReturns).toContainEqual(testReviewReturns[0])
        expect(result.reviewReturns).toContainEqual(testReviewReturns[1])
      })
    })
  })
})
