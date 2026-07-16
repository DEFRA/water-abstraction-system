// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import ReturnLogHelper from '../../support/helpers/return-log.helper.js'
import ReturnLogModel from '../../../app/models/return-log.model.js'

// Thing under test
import VoidReturnLogsService from '../../../app/services/return-logs/void-return-logs.service.js'

describe('Return Logs - Void Return Logs service', () => {
  let licenceRef = 'return-logs'
  let returnLogMatchingVersion
  let returnLogNotMatchingVersion
  let returnLogBeingChecked

  describe('when provided a licence ref with an end date', () => {
    beforeAll(async () => {
      licenceRef = 'return-logs-end-date'
      returnLogMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2023-03-31'),
        licenceRef,
        startDate: new Date('2022-04-01')
      })
      returnLogNotMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2024-03-31'),
        licenceRef,
        startDate: new Date('2023-04-01')
      })
    })

    it('voids the return logs that are between the start and end dates', async () => {
      await VoidReturnLogsService(licenceRef, new Date('2022-04-01'), new Date('2023-03-31'))

      returnLogBeingChecked = await returnLogMatchingVersion.$query()
      expect(returnLogBeingChecked.status).toEqual('void')

      returnLogBeingChecked = await returnLogNotMatchingVersion.$query()
      expect(returnLogBeingChecked.status).toEqual('due')
    })
  })

  describe('when provided a licence version id with no end date', () => {
    beforeAll(async () => {
      licenceRef = 'return-logs-no-end-date'
      returnLogBeingChecked = await ReturnLogHelper.add({
        endDate: new Date('2023-03-31'),
        licenceRef,
        startDate: new Date('2022-04-01')
      })
      returnLogNotMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2024-03-31'),
        licenceRef,
        startDate: new Date('2023-04-01')
      })
    })

    it('voids the return logs that are from the start date forward', async () => {
      await VoidReturnLogsService(licenceRef, new Date('2022-04-01'))

      returnLogBeingChecked = await returnLogMatchingVersion.$query()
      expect(returnLogBeingChecked.status).toEqual('void')

      returnLogBeingChecked = await returnLogNotMatchingVersion.$query()
      expect(returnLogBeingChecked.status).toEqual('void')
    })
  })

  describe('when provided a licence ref with no return logs', () => {
    it('does nothing', async () => {
      returnLogBeingChecked = await VoidReturnLogsService('no-return-logs', new Date('2020-03-31'))

      returnLogBeingChecked = await ReturnLogModel.query().where('licenceRef', 'no-return-logs')
      expect(returnLogBeingChecked).toEqual([])
    })
  })
})
