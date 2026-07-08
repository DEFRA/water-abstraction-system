'use strict'

// Test helpers
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')

// Thing under test
const FetchDownloadReturnLogService = require('../../../app/services/return-logs/fetch-download-return-log.service.js')

describe('Fetch Download Return Log service', () => {
  let returnLog
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
          returnSubmissionId: returnSubmissions[0].id,
          startDate: '2023-02-01',
          endDate: '2023-02-28',
          quantity: 10
        }),
        ReturnSubmissionLineHelper.add({
          returnSubmissionId: returnSubmissions[0].id,
          startDate: '2023-01-01',
          endDate: '2023-01-31',
          quantity: 5
        })
      ])
    })

    it('returns the return log with its related return submission and return submission lines', async () => {
      const result = await FetchDownloadReturnLogService(returnLog.id, 2)

      expect(result).toEqual({
        id: returnLog.id,
        returnReference: returnLog.returnReference,
        startDate: returnLog.startDate,
        endDate: returnLog.endDate,
        returnSubmissions: [
          {
            id: returnSubmissions[1].id,
            metadata: {},
            version: returnSubmissions[1].version,
            returnSubmissionLines: []
          }
        ]
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
          type: 'measured',
          units: 'm³',
          meters: [
            {
              units: 'm³',
              readings: {
                '2023-01-01_2023-01-31': 100,
                '2023-02-01_2023-02-28': 170
              },
              multiplier: 1,
              startReading: 0,
              meterDetailsProvided: false
            }
          ],
          method: 'oneMeter',
          totalFlag: false
        },
        returnLogId: returnLog.id,
        version: 1
      })

      await Promise.all([
        ReturnSubmissionLineHelper.add({
          returnSubmissionId: returnSubmissions.id,
          startDate: '2023-02-01',
          endDate: '2023-02-28',
          quantity: 100
        }),
        ReturnSubmissionLineHelper.add({
          returnSubmissionId: returnSubmissions.id,
          startDate: '2023-01-01',
          endDate: '2023-01-31',
          quantity: 70
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
})
