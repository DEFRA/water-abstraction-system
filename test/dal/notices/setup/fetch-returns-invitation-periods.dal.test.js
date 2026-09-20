// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import ReturnCycleHelper from 'water-abstraction-engine/test/helpers/return-cycle.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import { yesterday } from 'water-abstraction-engine/test/general.js'

// Thing under test
import FetchReturnsInvitationPeriods from '../../../../src/dal/notices/setup/fetch-returns-invitation-periods.dal.js'

describe('Notices - Setup - Fetch Returns Invitation Periods DAL', () => {
  let latestSummerCycle
  let latestSummerReturnLogs
  let latestWinterCycle
  let latestWinterReturnLogs
  let previousSummerCycle
  let previousSummerLogs
  let previousWinterCycle
  let previousWinterReturnLogs

  beforeAll(async () => {
    latestSummerCycle = await ReturnCycleHelper.select(0, true)
    latestWinterCycle = await ReturnCycleHelper.select(0, false)
    previousSummerCycle = await ReturnCycleHelper.select(1, true)
    previousWinterCycle = await ReturnCycleHelper.select(1, false)

    // This should be returned because it has a non-void return log with a null "due date"
    latestSummerReturnLogs = [
      await ReturnLogHelper.add({ returnCycleId: latestSummerCycle.id, dueDate: null, status: 'due' }),
      await ReturnLogHelper.add({ returnCycleId: latestSummerCycle.id, dueDate: null, status: 'void' }),
      await ReturnLogHelper.add({ returnCycleId: latestSummerCycle.id, dueDate: yesterday(), status: 'due' })
    ]
    // This should NOT be returned because all the linked return logs have a 'void' status
    latestWinterReturnLogs = [
      await ReturnLogHelper.add({ returnCycleId: latestWinterCycle.id, dueDate: null, status: 'void' })
    ]
    // This should not be returned because all the linked return logs have a non-null "due date"
    previousSummerLogs = [
      await ReturnLogHelper.add({ returnCycleId: previousSummerCycle.id, dueDate: yesterday(), status: 'due' })
    ]
    // This should be returned because it has a non-void return log with a null "due date"
    previousWinterReturnLogs = [
      await ReturnLogHelper.add({ returnCycleId: previousWinterCycle.id, dueDate: null, status: 'due' })
    ]
  })

  afterAll(async () => {
    for (const returnLog of latestSummerReturnLogs) {
      await returnLog.$query().delete()
    }

    for (const returnLog of latestWinterReturnLogs) {
      await returnLog.$query().delete()
    }

    for (const returnLog of previousSummerLogs) {
      await returnLog.$query().delete()
    }

    for (const returnLog of previousWinterReturnLogs) {
      await returnLog.$query().delete()
    }
  })

  describe('when called', () => {
    it('returns only those return cycles linked to non-void return logs with a null "due date"', async () => {
      const results = await FetchReturnsInvitationPeriods()

      expect(results).toEqual([
        {
          endDate: latestSummerCycle.endDate,
          id: latestSummerCycle.id,
          startDate: latestSummerCycle.startDate,
          summer: true
        },
        {
          endDate: previousWinterCycle.endDate,
          id: previousWinterCycle.id,
          startDate: previousWinterCycle.startDate,
          summer: false
        }
      ])
    })
  })
})
