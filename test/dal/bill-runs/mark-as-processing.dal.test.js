// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'

// Thing under test
import MarkAsProcessingDal from '../../../src/dal/bill-runs/mark-as-processing.dal.js'

describe('Bill Runs - Mark As Processing dal', () => {
  let billRun
  let today

  beforeEach(async () => {
    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'review' })

    today = new Date('2026-11-17')

    vi.useFakeTimers({ now: today, toFake: ['Date'] })
  })

  afterEach(async () => {
    vi.useRealTimers()

    await billRun.$query().delete()
  })

  it('sets the bill run status to "processing"', async () => {
    await MarkAsProcessingDal(billRun.id)

    const result = await BillRunModel.query().findById(billRun.id).select(['status', 'updatedAt'])

    expect(result).toEqual({ status: 'processing', updatedAt: today })
  })
})
