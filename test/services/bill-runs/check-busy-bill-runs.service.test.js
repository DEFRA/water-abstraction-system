// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import { db } from 'water-abstraction-engine/db/db.js'

// Thing under test
import CheckBusyBillRunsService from '../../../src/services/bill-runs/check-busy-bill-runs.service.js'

describe('Check Busy Bill Runs service', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
  })

  describe('when there are both building and cancelling bill runs', () => {
    beforeEach(() => {
      vi.spyOn(db, 'select').mockResolvedValue([{ building: true, cancelling: true }])
    })

    it('returns "both"', async () => {
      const result = await CheckBusyBillRunsService()

      expect(result).toEqual('both')
    })
  })

  describe('when there are cancelling bill runs', () => {
    beforeEach(() => {
      vi.spyOn(db, 'select').mockResolvedValue([{ building: false, cancelling: true }])
    })

    it('returns "cancelling"', async () => {
      const result = await CheckBusyBillRunsService()

      expect(result).toEqual('cancelling')
    })
  })

  describe('when there are building bill runs', () => {
    beforeEach(() => {
      vi.spyOn(db, 'select').mockResolvedValue([{ building: true, cancelling: false }])
    })

    it('returns "building"', async () => {
      const result = await CheckBusyBillRunsService()

      expect(result).toEqual('building')
    })
  })

  describe('when there are no building or cancelling bill runs', () => {
    beforeEach(() => {
      vi.spyOn(db, 'select').mockResolvedValue([{ building: false, cancelling: false }])
    })

    it('returns "none"', async () => {
      const result = await CheckBusyBillRunsService()

      expect(result).toEqual('none')
    })
  })
})
