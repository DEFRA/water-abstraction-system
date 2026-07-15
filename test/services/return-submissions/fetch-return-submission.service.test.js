// Test helpers
import * as ReturnLogHelper from '../../support/helpers/return-log.helper.js'
import * as ReturnSubmissionHelper from '../../support/helpers/return-submission.helper.js'
import * as ReturnSubmissionLineHelper from '../../support/helpers/return-submission-line.helper.js'
import ReturnLogModel from '../../../app/models/return-log.model.js'
import ReturnSubmissionLineModel from '../../../app/models/return-submission-line.model.js'
import ReturnSubmissionModel from '../../../app/models/return-submission.model.js'

// Thing under test
import FetchReturnSubmissionService from '../../../app/services/return-submissions/fetch-return-submission.service.js'

describe('Fetch Return Submission service', () => {
  let testReturnSubmission
  let testReturnLog

  beforeEach(async () => {
    testReturnSubmission = await ReturnSubmissionHelper.add({
      metadata: {
        units: 'Ml'
      }
    })
    testReturnLog = await ReturnLogHelper.add({ id: testReturnSubmission.returnLogId })

    await Promise.all([
      ReturnSubmissionLineHelper.add({
        returnSubmissionId: testReturnSubmission.id,
        startDate: '2023-03-01',
        quantity: 10
      }),
      ReturnSubmissionLineHelper.add({
        returnSubmissionId: testReturnSubmission.id,
        startDate: '2023-01-01',
        quantity: 5
      })
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the service is called', () => {
    it('fetches the return submission', async () => {
      const result = await FetchReturnSubmissionService(testReturnSubmission.id)

      expect(result).toBeInstanceOf(ReturnSubmissionModel)
      expect(result.id).toEqual(testReturnSubmission.id)
    })

    it('includes the expected metadata', async () => {
      const result = await FetchReturnSubmissionService(testReturnSubmission.id)

      expect(result.metadata.units).toEqual('Ml')
    })

    it('includes the return log id, submission version and current version used for the back link', async () => {
      const result = await FetchReturnSubmissionService(testReturnSubmission.id)

      expect(result.returnLogId).toEqual(testReturnSubmission.returnLogId)
      expect(result.version).toEqual(testReturnSubmission.version)
      expect(result.current).toEqual(testReturnSubmission.current)
    })

    it('includes the linked return submission lines, ordered by start date', async () => {
      const result = await FetchReturnSubmissionService(testReturnSubmission.id)
      const { returnSubmissionLines } = result

      expect(returnSubmissionLines).toHaveLength(2)
      expect(returnSubmissionLines[0]).toBeInstanceOf(ReturnSubmissionLineModel)
      expect(returnSubmissionLines[1]).toBeInstanceOf(ReturnSubmissionLineModel)
      expect(returnSubmissionLines[0].startDate.toISOString()).toEqual('2023-01-01T00:00:00.000Z')
      expect(returnSubmissionLines[1].startDate.toISOString()).toEqual('2023-03-01T00:00:00.000Z')
    })

    it('includes the linked return log with its reference and frequency', async () => {
      const result = await FetchReturnSubmissionService(testReturnSubmission.id)
      const { returnLog } = result

      expect(returnLog).toBeInstanceOf(ReturnLogModel)
      expect(returnLog.returnReference).toEqual(testReturnLog.returnReference)
      expect(returnLog.returnsFrequency).toEqual(testReturnLog.returnsFrequency)
    })
  })
})
