// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'

// Thing under test
import FetchBillRunDal from '../../../../src/dal/bill-runs/cancel/fetch-bill-run.dal.js'

describe('Bill Runs - Cancel - Fetch Bill Run dal', () => {
  let billRun
  let region

  beforeEach(async () => {
    region = RegionHelper.select()

    billRun = await BillRunHelper.add({ batchType: 'annual', regionId: region.id, status: 'ready' })
  })

  afterEach(async () => {
    await billRun.$query().delete()
  })

  describe('when a matching bill run exists', () => {
    it('returns the bill run and its region', async () => {
      const result = await FetchBillRunDal(billRun.id)

      expect(result).toEqual({
        batchType: 'annual',
        billRunNumber: billRun.billRunNumber,
        createdAt: billRun.createdAt,
        id: billRun.id,
        region: {
          displayName: region.displayName,
          id: region.id
        },
        scheme: 'sroc',
        status: 'ready',
        summer: billRun.summer,
        toFinancialYearEnding: 2023
      })
    })
  })
})
