// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'

// Thing under test
import FetchBillRunDal from '../../../src/dal/bill-runs/fetch-bill-run.dal.js'

describe('Bill Runs - Fetch Bill Run dal', () => {
  let billRun

  beforeEach(async () => {
    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'review' })
  })

  afterEach(async () => {
    await billRun.$query().delete()
  })

  it('returns the bill run', async () => {
    const result = await FetchBillRunDal(billRun.id)

    expect(result).toEqual({
      batchType: 'two_part_tariff',
      createdAt: billRun.createdAt,
      externalId: billRun.externalId,
      id: billRun.id,
      regionId: billRun.regionId,
      scheme: 'sroc',
      status: 'review',
      toFinancialYearEnding: 2023
    })
  })
})
