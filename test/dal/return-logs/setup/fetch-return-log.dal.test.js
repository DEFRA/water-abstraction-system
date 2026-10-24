// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import PurposeHelper from 'water-abstraction-engine/test/helpers/purpose.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReturnRequirementPurposeHelper from 'water-abstraction-engine/test/helpers/return-requirement-purpose.helper.js'
import ReturnSubmissionHelper from 'water-abstraction-engine/test/helpers/return-submission.helper.js'
import ReturnSubmissionLineHelper from 'water-abstraction-engine/test/helpers/return-submission-line.helper.js'

// Thing under test
import FetchReturnLogDal from '../../../../src/dal/return-logs/setup/fetch-return-log.dal.js'

describe('Return Logs - Setup - Fetch Return Log DAL', () => {
  let licence
  let purposes
  let returnLog
  let returnRequirement
  let returnRequirementPurposes
  let returnSubmission
  let returnSubmissionLines
  let supersededReturnSubmission

  beforeAll(async () => {
    returnRequirementPurposes = []
    returnSubmissionLines = []

    licence = await LicenceHelper.add()

    returnRequirement = await ReturnRequirementHelper.add({ reference: 9999983 })

    purposes = [PurposeHelper.select(0), PurposeHelper.select(1)]

    // NOTE: We deliberately add the purposes in reverse order so the results demonstrate they are sorted by description
    for (const purpose of purposes.toReversed()) {
      const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id
      })

      returnRequirementPurposes.push(returnRequirementPurpose)
    }

    returnLog = await ReturnLogHelper.add({
      licenceRef: licence.licenceRef,
      returnRequirementId: returnRequirement.id
    })

    // NOTE: We add a superseded return submission to demonstrate only the current one is returned
    supersededReturnSubmission = await ReturnSubmissionHelper.add({
      returnLogId: returnLog.id,
      current: false,
      version: 1
    })

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
    await returnRequirement.$query().delete()
    await returnSubmission.$query().delete()
    await supersededReturnSubmission.$query().delete()

    for (const returnRequirementPurpose of returnRequirementPurposes) {
      await returnRequirementPurpose.$query().delete()
    }

    for (const returnSubmissionLine of returnSubmissionLines) {
      await returnSubmissionLine.$query().delete()
    }
  })

  describe('when a matching return log exists', () => {
    it('returns the return log, its licence, return requirement, purposes and current return submission', async () => {
      const result = await FetchReturnLogDal(returnLog.id)

      expect(result).toEqual({
        dueDate: returnLog.dueDate,
        endDate: returnLog.endDate,
        id: returnLog.id,
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        },
        receivedDate: returnLog.receivedDate,
        returnId: returnLog.returnId,
        returnRequirement: {
          abstractionPeriodEndDay: returnRequirement.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: returnRequirement.abstractionPeriodEndMonth,
          abstractionPeriodStartDay: returnRequirement.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: returnRequirement.abstractionPeriodStartMonth,
          id: returnRequirement.id,
          reference: returnRequirement.reference,
          returnRequirementPurposes: [
            { description: purposes[0].description },
            { description: purposes[1].description }
          ],
          siteDescription: returnRequirement.siteDescription,
          twoPartTariff: returnRequirement.twoPartTariff
        },
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
  })
})
