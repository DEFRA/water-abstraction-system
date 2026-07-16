// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { determineCurrentFinancialYear } from '../../../../app/lib/general.lib.js'
import { engineTriggers } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import * as FetchLiveBillRunService from '../../../../app/services/bill-runs/setup/fetch-live-bill-run.service.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Thing under test
import DetermineBlockingAnnualService from '../../../../app/services/bill-runs/setup/determine-blocking-annual.service.js'

describe('Bill Runs - Setup - Determine Blocking Annual Bill Run service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'
  const toFinancialYearEnding = currentFinancialYear.endDate.getFullYear()

  let billRunQueryStub
  let match

  beforeEach(() => {
    match = {
      id: 'aadb1af8-16d5-46c3-9b80-00a6201b8196',
      batchType: 'annual',
      billRunNumber: 1045,
      createdAt: new Date('2024-04-11'),
      scheme: 'sroc',
      status: 'sent',
      summer: false,
      toFinancialYearEnding
    }

    billRunQueryStub = {
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      whereNotIn: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis(),
      modifyGraph: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis()
    }
  })

  afterEach(async () => {
    vi.restoreAllMocks()
  })

  describe('when there is a matching bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = vi.fn().mockResolvedValue(match)

      vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
      vi.spyOn(FetchLiveBillRunService, 'default').mockResolvedValue()
    })

    it('returns the match and determines that neither engine can be triggered', async () => {
      const result = await DetermineBlockingAnnualService(regionId)

      expect(result).toEqual({ matches: [match], toFinancialYearEnding, trigger: engineTriggers.neither })
    })

    it('does not bother to check for live bill runs', async () => {
      await DetermineBlockingAnnualService(regionId, toFinancialYearEnding)

      expect(FetchLiveBillRunService.default).not.toHaveBeenCalled()
    })
  })

  describe('when there is no matching bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = vi.fn().mockResolvedValue(null)
    })

    describe('and no live bill run', () => {
      beforeEach(() => {
        vi.spyOn(FetchLiveBillRunService, 'default').mockResolvedValue(null)
      })

      it('returns no matches and determines that the "current" engine can be triggered', async () => {
        const result = await DetermineBlockingAnnualService(regionId)

        expect(result).toEqual({ matches: [], toFinancialYearEnding, trigger: engineTriggers.current })
      })
    })

    describe('but there is a live bill run', () => {
      beforeEach(() => {
        match.batchType = 'supplementary'
        match.status = 'ready'

        vi.spyOn(FetchLiveBillRunService, 'default').mockResolvedValue(match)
      })

      it('returns the match and determines that neither engine can be triggered', async () => {
        const result = await DetermineBlockingAnnualService(regionId)

        expect(result).toEqual({ matches: [match], toFinancialYearEnding, trigger: engineTriggers.neither })
      })
    })
  })
})
