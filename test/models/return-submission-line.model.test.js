// Test helpers
import ReturnSubmissionHelper from '../support/helpers/return-submission.helper.js'
import ReturnSubmissionLineHelper from '../support/helpers/return-submission-line.helper.js'
import ReturnSubmissionModel from '../../app/models/return-submission.model.js'

// Thing under test
import ReturnSubmissionLineModel from '../../app/models/return-submission-line.model.js'

describe('Return Submission Line model', () => {
  let testRecord
  let testReturnSubmission

  beforeAll(async () => {
    testReturnSubmission = await ReturnSubmissionHelper.add()

    testRecord = await ReturnSubmissionLineHelper.add({ returnSubmissionId: testReturnSubmission.id })
  })

  afterAll(async () => {
    await testReturnSubmission.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnSubmissionLineModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReturnSubmissionLineModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return submission', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnSubmissionLineModel.query().innerJoinRelated('returnSubmission')

        expect(query).toBeDefined()
      })

      it('can eager load the return submission', async () => {
        const result = await ReturnSubmissionLineModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnSubmission')

        expect(result).toBeInstanceOf(ReturnSubmissionLineModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnSubmission).toBeInstanceOf(ReturnSubmissionModel)
        expect(result.returnSubmission).toEqual(testReturnSubmission)
      })
    })
  })
})
