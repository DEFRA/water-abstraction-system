// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import ReturnCycleHelper from 'water-abstraction-engine/test/helpers/return-cycle.helper.js'

// Thing under test
import FetchReturnCycle from '../../../../src/dal/notices/setup/fetch-return-cycle.dal.js'

describe('Notices - Setup - Fetch Return Cycle DAL', () => {
  let returnCycle

  beforeAll(async () => {
    returnCycle = await ReturnCycleHelper.select()
  })

  describe('when called', () => {
    it('returns the matching return cycle', async () => {
      const results = await FetchReturnCycle(returnCycle.id)

      expect(results).toEqual({
        dueDate: returnCycle.dueDate,
        endDate: returnCycle.endDate,
        id: returnCycle.id,
        startDate: returnCycle.startDate,
        summer: returnCycle.summer
      })
    })
  })
})
