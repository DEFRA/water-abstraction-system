// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReturnSubmissionHelper from 'water-abstraction-engine/test/helpers/return-submission.helper.js'
import ReturnSubmissionLineHelper from 'water-abstraction-engine/test/helpers/return-submission-line.helper.js'

// Thing under test
import FetchReturnLogDal from '../../../../src/dal/return-logs/setup/fetch-return-log.dal.js'

describe('Return Logs - Setup - Fetch Return Log DAL', () => {
  let licence
  let returnLog
  let returnRequirement
  let returnSubmission
  let returnSubmissionLines

  beforeAll(async () => {
    returnSubmissionLines = []

    licence = await LicenceHelper.add()

    returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })

    // NOTE: We add a superseded return submission to demonstrate only the current one is returned
    await ReturnSubmissionHelper.add({ returnLogId: returnLog.id, current: false, version: 1 })

    returnSubmission = await ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 2 })

    // NOTE: We deliberately add May before April so the results demonstrate the lines are returned in date order
    // rather than the order they were added
    for (const startDate of ['2022-05-01', '2022-04-01']) {
      const returnSubmissionLine = await ReturnSubmissionLineHelper.add({
        returnSubmissionId: returnSubmission.id,
        startDate: new Date(startDate)
      })

      returnSubmissionLines.push(returnSubmissionLine)
    }
  })

  afterAll(async () => {
    await licence.$query().delete()
    await returnLog.$query().delete()
  })

  describe('when a matching return log exists', () => {
    it('returns the return log, its licence and its current return submission', async () => {
      const result = await FetchReturnLogDal(returnLog.id)

      expect(result).toEqual({
        dueDate: returnLog.dueDate,
        endDate: returnLog.endDate,
        id: returnLog.id,
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        },
        metadata: returnLog.metadata,
        receivedDate: returnLog.receivedDate,
        returnId: returnLog.returnId,
        returnReference: Number(returnLog.returnReference),
        returnsFrequency: returnLog.returnsFrequency,
        returnSubmissions: [
          {
            metadata: returnSubmission.metadata,
            nilReturn: returnSubmission.nilReturn,
            returnSubmissionLines: [
              {
                endDate: returnSubmissionLines[1].endDate,
                id: returnSubmissionLines[1].id,
                quantity: returnSubmissionLines[1].quantity,
                startDate: new Date('2022-04-01'),
                userUnit: returnSubmissionLines[1].userUnit
              },
              {
                endDate: returnSubmissionLines[0].endDate,
                id: returnSubmissionLines[0].id,
                quantity: returnSubmissionLines[0].quantity,
                startDate: new Date('2022-05-01'),
                userUnit: returnSubmissionLines[0].userUnit
              }
            ]
          }
        ],
        startDate: returnLog.startDate,
        status: returnLog.status,
        underQuery: returnLog.underQuery
      })
    })

    describe('and it is linked to a return requirement', () => {
      let linkedReturnLog

      beforeAll(async () => {
        returnRequirement = await ReturnRequirementHelper.add({ reference: 9999983 })

        linkedReturnLog = await ReturnLogHelper.add({
          licenceRef: licence.licenceRef,
          returnRequirementId: returnRequirement.id
        })
      })

      afterAll(async () => {
        await linkedReturnLog.$query().delete()
        await returnRequirement.$query().delete()
      })

      it('returns the return reference taken from the return requirement', async () => {
        const result = await FetchReturnLogDal(linkedReturnLog.id)

        expect(result.returnReference).toEqual(returnRequirement.reference)
      })
    })
  })
})
