// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReturnSubmissionHelper from 'water-abstraction-engine/test/helpers/return-submission.helper.js'
import ReturnSubmissionLineHelper from 'water-abstraction-engine/test/helpers/return-submission-line.helper.js'
import ReturnSubmissionLineModel from 'water-abstraction-engine/models/return-submission-line.model.js'
import ReturnSubmissionModel from 'water-abstraction-engine/models/return-submission.model.js'

// Thing under test
import FetchReturnSubmissionService from '../../../src/services/return-submissions/fetch-return-submission.service.js'

describe('Fetch Return Submission service', () => {
  let testReturnLog
  let testReturnRequirement
  let testReturnSubmission

  beforeEach(async () => {
    testReturnSubmission = await ReturnSubmissionHelper.add({
      metadata: {
        units: 'Ml'
      }
    })
    testReturnRequirement = await ReturnRequirementHelper.add()
    testReturnLog = await ReturnLogHelper.add({
      id: testReturnSubmission.returnLogId,
      returnRequirementId: testReturnRequirement.id
    })

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
      expect(returnLog.returnReference).toEqual(testReturnRequirement.reference)
      expect(returnLog.returnsFrequency).toEqual(testReturnLog.returnsFrequency)
    })

    describe('and the return log is not linked to a return requirement', () => {
      beforeEach(async () => {
        await testReturnLog.$query().patch({ returnRequirementId: null })
      })

      it('falls back to the reference held against the return log', async () => {
        const result = await FetchReturnSubmissionService(testReturnSubmission.id)

        const expectedReference = Number(testReturnLog.returnReference)

        expect(result.returnLog.returnReference).toEqual(expectedReference)
      })
    })
  })
})
