// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'
import * as ReturnLogHelper from '../../../support/helpers/return-log.helper.js'
import * as ReturnSubmissionHelper from '../../../support/helpers/return-submission.helper.js'
import * as LicenceHelper from '../../../support/helpers/licence.helper.js'

// Thing under test
import FetchReturnLogService from '../../../../app/services/return-logs/setup/fetch-return-log.service.js'

describe('Return Logs - Setup - Fetch Return Log service', () => {
  let licence
  let returnLog

  describe('when a matching return log exists', () => {
    beforeAll(async () => {
      licence = await LicenceHelper.add()

      returnLog = await ReturnLogHelper.add({
        licenceRef: licence.licenceRef,
        metadata: {
          purposes: [
            {
              alias: 'SPRAY IRRIGATION',
              primary: {
                code: 'I',
                description: 'Industrial, Commercial And Public Services'
              },
              tertiary: {
                code: '400',
                description: 'Spray Irrigation - Direct'
              },
              secondary: {
                code: 'GOF',
                description: 'Golf Courses'
              }
            }
          ],
          description: ' STOCKLEY PARK, UXBRIDGE'
        }
      })
    })

    it('returns the return log instance', async () => {
      const result = await FetchReturnLogService(returnLog.id)

      expect(result).toEqual({
        id: returnLog.id,
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        returnReference: returnLog.returnReference,
        purposes: returnLog.metadata.purposes,
        siteDescription: returnLog.metadata.description,
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
