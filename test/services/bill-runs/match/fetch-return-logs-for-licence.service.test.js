// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import GlobalNotifierStub from 'water-abstraction-engine/test/stubs/global-notifier.stub.js'
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as FetchReturnLogsForLicenceDal from '../../../../src/dal/bill-runs/match/fetch-return-logs-for-licence.dal.js'

// Thing under test
import FetchReturnLogsForLicenceService from '../../../../src/services/bill-runs/match/fetch-return-logs-for-licence.service.js'

describe('Bill Runs - Match - Fetch Return Logs For Licence service', () => {
  const billingPeriod = { endDate: new Date('2023-03-31'), startDate: new Date('2022-04-01') }

  let licenceRef
  let notifierStub
  let returnLogs

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    returnLogs = [
      {
        id: generateUUID(),
        periodEndDay: 31,
        periodEndMonth: 3,
        periodStartDay: 1,
        periodStartMonth: 4
      }
    ]

    // This depends on the GlobalNotifier to have been set. This happens in the GlobalNotifierPlugin
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when the return logs have an abstraction period', () => {
    beforeEach(() => {
      vi.spyOn(FetchReturnLogsForLicenceDal, 'default').mockResolvedValue(returnLogs)
    })

    it('returns the return logs', async () => {
      const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

      expect(result).toEqual(returnLogs)
    })
  })

  // NOTE: Added after we had a bill run error because a licence was linked to a return log where the abstraction period
  // data was all set to "null". It was set like this because the period had not been set against the return requirement
  // the return log was generated from.
  describe('when a return log is missing its abstraction period', () => {
    beforeEach(() => {
      returnLogs[0].periodEndDay = null
      returnLogs[0].periodEndMonth = null
      returnLogs[0].periodStartDay = null
      returnLogs[0].periodStartMonth = null

      vi.spyOn(FetchReturnLogsForLicenceDal, 'default').mockResolvedValue(returnLogs)
    })

    it('logs the error and throws it', async () => {
      await expect(FetchReturnLogsForLicenceService(licenceRef, billingPeriod)).rejects.toThrow(
        `Return log is missing abstraction period data for licence ${licenceRef}`
      )

      expect(notifierStub.omg).toHaveBeenCalledWith(
        `Bill run fetch return logs for licence failed for licence ${licenceRef} due to missing abstraction period`,
        { returnLogs }
      )
    })
  })
})
