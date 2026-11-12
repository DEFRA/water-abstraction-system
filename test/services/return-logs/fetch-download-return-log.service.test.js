// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReturnSubmissionHelper from 'water-abstraction-engine/test/helpers/return-submission.helper.js'
import ReturnSubmissionLineHelper from 'water-abstraction-engine/test/helpers/return-submission-line.helper.js'

// Thing under test
import FetchDownloadReturnLogService from '../../../src/services/return-logs/fetch-download-return-log.service.js'

describe('Fetch Download Return Log service', () => {
  let returnLog
  let returnRequirement
  let returnSubmissions

  describe('when a return log exists that used abstraction volumes', () => {
    beforeAll(async () => {
      returnLog = await ReturnLogHelper.add()

      returnSubmissions = await Promise.all([
        ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 1 }),
        ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 2 }),
        ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 3 })
      ])

      await Promise.all([
        ReturnSubmissionLineHelper.add({
          endDate: '2023-02-28',
          quantity: 10,
          returnSubmissionId: returnSubmissions[0].id,
          startDate: '2023-02-01'
        }),
        ReturnSubmissionLineHelper.add({
          endDate: '2023-01-31',
          quantity: 5,
          returnSubmissionId: returnSubmissions[0].id,
          startDate: '2023-01-01'
        })
      ])
    })

    it('returns the return log with its related return submission and return submission lines', async () => {
      const result = await FetchDownloadReturnLogService(returnLog.id, 2)

      expect(result).toEqual({
        endDate: returnLog.endDate,
        id: returnLog.id,
        returnReference: Number(returnLog.returnReference),
        returnSubmissions: [
          {
            id: returnSubmissions[1].id,
            metadata: {},
            returnSubmissionLines: [],
            version: returnSubmissions[1].version
          }
        ],
        startDate: returnLog.startDate
      })
    })

    it('orders submission lines by start date', async () => {
      const result = await FetchDownloadReturnLogService(returnLog.id, '1')
      const lines = result.returnSubmissions[0].returnSubmissionLines

      expect(lines).toHaveLength(2)
      expect(lines[0].startDate.toISOString()).toEqual('2023-01-01T00:00:00.000Z')
      expect(lines[0].endDate.toISOString()).toEqual('2023-01-31T00:00:00.000Z')
      expect(lines[1].startDate.toISOString()).toEqual('2023-02-01T00:00:00.000Z')
      expect(lines[1].endDate.toISOString()).toEqual('2023-02-28T00:00:00.000Z')
    })
  })

  describe('when a return log exists that used meter readings', () => {
    beforeAll(async () => {
      returnLog = await ReturnLogHelper.add()

      returnSubmissions = await ReturnSubmissionHelper.add({
        metadata: {
          meters: [
            {
              meterDetailsProvided: false,
              multiplier: 1,
              readings: {
                '2023-01-01_2023-01-31': 100,
                '2023-02-01_2023-02-28': 170
              },
              startReading: 0,
              units: 'm³'
            }
          ],
          method: 'oneMeter',
          totalFlag: false,
          type: 'measured',
          units: 'm³'
        },
        returnLogId: returnLog.id,
        version: 1
      })

      await Promise.all([
        ReturnSubmissionLineHelper.add({
          endDate: '2023-02-28',
          quantity: 100,
          returnSubmissionId: returnSubmissions.id,
          startDate: '2023-02-01'
        }),
        ReturnSubmissionLineHelper.add({
          endDate: '2023-01-31',
          quantity: 70,
          returnSubmissionId: returnSubmissions.id,
          startDate: '2023-01-01'
        })
      ])
    })

    it('returns the return log with the submission lines populated with the meter readings', async () => {
      const result = await FetchDownloadReturnLogService(returnLog.id, '1')
      const lines = result.returnSubmissions[0].returnSubmissionLines

      expect(lines).toHaveLength(2)
      expect(lines[0].startDate.toISOString()).toEqual('2023-01-01T00:00:00.000Z')
      expect(lines[0].endDate.toISOString()).toEqual('2023-01-31T00:00:00.000Z')
      expect(lines[0].quantity).toEqual(70)
      expect(lines[0].reading).toEqual(100)
      expect(lines[1].startDate.toISOString()).toEqual('2023-02-01T00:00:00.000Z')
      expect(lines[1].endDate.toISOString()).toEqual('2023-02-28T00:00:00.000Z')
      expect(lines[1].quantity).toEqual(100)
      expect(lines[1].reading).toEqual(170)
    })
  })

  describe('when a return log exists that is linked to a return requirement', () => {
    beforeAll(async () => {
      returnRequirement = await ReturnRequirementHelper.add({ reference: 9999981 })

      returnLog = await ReturnLogHelper.add({ returnRequirementId: returnRequirement.id })

      returnSubmissions = await ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 1 })
    })

    it('returns the return log, with the reference taken from the return requirement', async () => {
      const result = await FetchDownloadReturnLogService(returnLog.id, 1)

      expect(result).toEqual({
        endDate: returnLog.endDate,
        id: returnLog.id,
        returnReference: returnRequirement.reference,
        returnSubmissions: [
          {
            id: returnSubmissions.id,
            metadata: {},
            returnSubmissionLines: [],
            version: returnSubmissions.version
          }
        ],
        startDate: returnLog.startDate
      })
    })
  })
})
