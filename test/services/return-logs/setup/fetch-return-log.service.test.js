// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import PurposeHelper from 'water-abstraction-engine/test/helpers/purpose.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReturnRequirementPurposeHelper from 'water-abstraction-engine/test/helpers/return-requirement-purpose.helper.js'
import ReturnSubmissionHelper from 'water-abstraction-engine/test/helpers/return-submission.helper.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import FetchReturnLogService from '../../../../src/services/return-logs/setup/fetch-return-log.service.js'

describe('Return Logs - Setup - Fetch Return Log service', () => {
  let licence
  let purposes
  let returnLog
  let returnRequirement

  describe('when a matching return log exists', () => {
    beforeAll(async () => {
      licence = await LicenceHelper.add()

      returnRequirement = await ReturnRequirementHelper.add({ reference: 9999980 })

      const firstPurpose = PurposeHelper.select(0)
      const secondPurpose = PurposeHelper.select(1)

      await ReturnRequirementPurposeHelper.add({
        purposeId: firstPurpose.id,
        returnRequirementId: returnRequirement.id
      })
      await ReturnRequirementPurposeHelper.add({
        purposeId: secondPurpose.id,
        returnRequirementId: returnRequirement.id
      })

      purposes = [firstPurpose.description, secondPurpose.description].sort()

      returnLog = await ReturnLogHelper.add({
        licenceRef: licence.licenceRef,
        returnRequirementId: returnRequirement.id
      })
    })

    it('returns the return log instance, with the reference, purposes and site description taken from the return requirement', async () => {
      const result = await FetchReturnLogService(returnLog.id)

      expect(result).toEqual({
        id: returnLog.id,
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        returnReference: returnRequirement.reference,
        purposes,
        siteDescription: returnRequirement.siteDescription,
        status: returnLog.status,
        submissionCount: 0
      })
    })

    describe('with multiple return submissions', () => {
      beforeAll(async () => {
        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id })
        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 2 })
      })

      it('returns a count of the associated return submissions', async () => {
        const result = await FetchReturnLogService(returnLog.id)

        expect(result.submissionCount).toEqual(2)
      })
    })
  })

  describe('when a matching return log does not exist', () => {
    it('returns undefined', async () => {
      const result = await FetchReturnLogService(generateUUID())

      expect(result).toBeUndefined()
    })
  })
})
