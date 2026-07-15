// Test helpers
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import ReturnCycleHelper from '../support/helpers/return-cycle.helper.js'
import ReturnCycleModel from '../../app/models/return-cycle.model.js'
import ReturnLogHelper from '../support/helpers/return-log.helper.js'
import ReturnRequirementHelper from '../support/helpers/return-requirement.helper.js'
import ReturnRequirementModel from '../../app/models/return-requirement.model.js'
import ReturnSubmissionHelper from '../support/helpers/return-submission.helper.js'
import ReturnSubmissionModel from '../../app/models/return-submission.model.js'
import ReviewReturnHelper from '../support/helpers/review-return.helper.js'
import ReviewReturnModel from '../../app/models/review-return.model.js'

// Thing under test
import ReturnLogModel from '../../app/models/return-log.model.js'

describe('Return Log model', () => {
  let testLicence
  let testRecord
  let testReturnCycle
  let testReturnRequirements
  let testReturnSubmissions
  let testReviewReturns

  beforeAll(async () => {
    testLicence = await LicenceHelper.add()
    testReturnCycle = await ReturnCycleHelper.select()
    testReturnRequirements = await ReturnRequirementHelper.add()

    testRecord = await ReturnLogHelper.add({
      licenceRef: testLicence.licenceRef,
      returnCycleId: testReturnCycle.id,
      returnRequirementId: testReturnRequirements.id
    })

    testReturnSubmissions = []
    for (let i = 0; i < 2; i++) {
      const version = i
      const returnSubmission = await ReturnSubmissionHelper.add({ returnLogId: testRecord.id, version })

      testReturnSubmissions.push(returnSubmission)
    }

    testReviewReturns = []
    for (let i = 0; i < 2; i++) {
      const reviewReturn = await ReviewReturnHelper.add({ returnLogId: testRecord.id })

      testReviewReturns.push(reviewReturn)
    }
  })

  afterAll(async () => {
    await testLicence.$query().delete()
    await testReturnRequirements.$query().delete()

    for (const returnSubmission of testReturnSubmissions) {
      await returnSubmission.$query().delete()
    }

    for (const reviewReturn of testReviewReturns) {
      await reviewReturn.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnLogModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReturnLogModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(ReturnLogModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to return cycles', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('returnCycle')

        expect(query).toBeDefined()
      })

      it('can eager load the return submissions', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('returnCycle')

        expect(result).toBeInstanceOf(ReturnLogModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.returnCycle).toBeInstanceOf(ReturnCycleModel)
        expect(result.returnCycle).toMatchObject(testReturnCycle)
      })
    })

    describe('when linking to return requirements', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('returnRequirement')

        expect(query).toBeDefined()
      })

      it('can eager load the return requirements', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('returnRequirement')

        expect(result).toBeInstanceOf(ReturnLogModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnRequirement).toBeInstanceOf(ReturnRequirementModel)
        expect(result.returnRequirement).toEqual(testReturnRequirements)
      })
    })

    describe('when linking to return submissions', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('returnSubmissions')

        expect(query).toBeDefined()
      })

      it('can eager load the return submissions', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('returnSubmissions')

        expect(result).toBeInstanceOf(ReturnLogModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnSubmissions).toBeInstanceOf(Array)
        expect(result.returnSubmissions[0]).toBeInstanceOf(ReturnSubmissionModel)
        expect(result.returnSubmissions).toContainEqual(testReturnSubmissions[0])
        expect(result.returnSubmissions).toContainEqual(testReturnSubmissions[1])
      })
    })

    describe('when linking to review returns', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query().innerJoinRelated('reviewReturns')

        expect(query).toBeDefined()
      })

      it('can eager load the review returns', async () => {
        const result = await ReturnLogModel.query().findById(testRecord.id).withGraphFetched('reviewReturns')

        expect(result).toBeInstanceOf(ReturnLogModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewReturns).toBeInstanceOf(Array)
        expect(result.reviewReturns[0]).toBeInstanceOf(ReviewReturnModel)
        expect(result.reviewReturns).toContainEqual(testReviewReturns[0])
        expect(result.reviewReturns).toContainEqual(testReviewReturns[1])
      })
    })
  })
})
