// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { engineTriggers } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import * as FetchLiveBillRunService from '../../../../app/services/bill-runs/setup/fetch-live-bill-run.service.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Thing under test
import DetermineBlockingTwoPartAnnualService from '../../../../app/services/bill-runs/setup/determine-blocking-two-part-annual.service.js'

describe('Bill Runs - Setup - Determine Blocking Two Part Annual Bill Run service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let billRunQueryStub
  let match
  let summer
  let year

  beforeEach(() => {
    year = 2024
    summer = false

    match = {
      id: 'aadb1af8-16d5-46c3-9b80-00a6201b8196',
      batchType: 'two_part_tariff',
      billRunNumber: 1045,
      createdAt: new Date('2023-04-11'),
      scheme: 'sroc',
      status: 'sent',
      summer,
      toFinancialYearEnding: year
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
    describe('for an SROC era bill run', () => {
      beforeEach(() => {
        billRunQueryStub.first = vi.fn().mockResolvedValue(match)

        vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
        vi.spyOn(FetchLiveBillRunService, 'default').mockResolvedValue()
      })

      it('returns the match and determines that neither engine can be triggered', async () => {
        const result = await DetermineBlockingTwoPartAnnualService(regionId, year)

        expect(result).toEqual({ matches: [match], toFinancialYearEnding: year, trigger: engineTriggers.neither })
      })

      it('does not bother to check for live bill runs', async () => {
        await DetermineBlockingTwoPartAnnualService(regionId, year)

        expect(FetchLiveBillRunService.default).not.toHaveBeenCalled()
      })
    })

    describe('for a PRESROC era bill run', () => {
      beforeEach(() => {
        year = 2021
        summer = true

        match.toFinancialYearEnding = year
        match.summer = summer

        billRunQueryStub.first = vi.fn().mockResolvedValue(match)

        vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
        vi.spyOn(FetchLiveBillRunService, 'default').mockResolvedValue()
      })

      it('returns the match and determines that neither engine can be triggered', async () => {
        const result = await DetermineBlockingTwoPartAnnualService(regionId, year)

        expect(result).toEqual({ matches: [match], toFinancialYearEnding: year, trigger: engineTriggers.neither })
      })

      it('does not bother to check for live bill runs', async () => {
        await DetermineBlockingTwoPartAnnualService(regionId, year)

        expect(FetchLiveBillRunService.default).not.toHaveBeenCalled()
      })
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

      describe('for an SROC era bill run', () => {
        it('returns no matches and determines that the "current" engine can be triggered', async () => {
          const result = await DetermineBlockingTwoPartAnnualService(regionId, year)

          expect(result).toEqual({ matches: [], toFinancialYearEnding: year, trigger: engineTriggers.current })
        })
      })

      describe('for a PRESROC era bill run', () => {
        beforeEach(() => {
          year = 2021
          summer = true
        })

        it('returns no matches and determines that the "old" engine can be triggered', async () => {
          const result = await DetermineBlockingTwoPartAnnualService(regionId, year, summer)

          expect(result).toEqual({ matches: [], toFinancialYearEnding: year, trigger: engineTriggers.old })
        })
      })
    })

    describe('but there is a live bill run', () => {
      beforeEach(() => {
        match.batchType = 'supplementary'
        match.status = 'ready'

        vi.spyOn(FetchLiveBillRunService, 'default').mockResolvedValue(match)
      })

      it('returns the match and determines that neither engine can be triggered', async () => {
        const result = await DetermineBlockingTwoPartAnnualService(regionId, year)

        expect(result).toEqual({ matches: [match], toFinancialYearEnding: year, trigger: engineTriggers.neither })
      })
    })
  })
})
