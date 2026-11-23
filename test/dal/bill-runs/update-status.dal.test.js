// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'

// Thing under test
import UpdateStatusDal from '../../../src/dal/bill-runs/update-status.dal.js'

describe('Bill Runs - Update Status dal', () => {
  let billRun
  let status
  let today

  beforeEach(async () => {
    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'review' })

    status = 'processing'

    today = new Date('2026-11-17')

    vi.useFakeTimers({ now: today, toFake: ['Date'] })
  })

  afterEach(async () => {
    vi.useRealTimers()

    await billRun.$query().delete()
  })

  it('sets the bill run status to "processing"', async () => {
    await UpdateStatusDal(billRun.id, status)

    const result = await BillRunModel.query().findById(billRun.id).select(['status', 'updatedAt'])

    expect(result).toEqual({ status: 'processing', updatedAt: today })
  })
})
