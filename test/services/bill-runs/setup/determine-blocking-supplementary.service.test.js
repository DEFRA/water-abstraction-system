// Test framework dependencies

// Test helpers
import { determineCurrentFinancialYear } from '../../../../app/lib/general.lib.js'
import { engineTriggers } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Thing under test
import DetermineBlockingSupplementaryService from '../../../../app/services/bill-runs/setup/determine-blocking-supplementary.service.js'

describe('Bill Runs - Setup - Determine Blocking Supplementary Bill Run service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'
  const toFinancialYearEnding = currentFinancialYear.endDate.getFullYear()

  let billRunQueryStub
  let lastAnnualMatch
  let preSrocMatch
  let srocMatch

  beforeEach(() => {
    lastAnnualMatch = {
      id: 'abd2733b-32c7-4b24-b32d-cefc96ca697a',
      toFinancialYearEnding
    }

    srocMatch = {
      id: 'aadb1af8-16d5-46c3-9b80-00a6201b8196',
      batchType: 'supplementary',
      billRunNumber: 1045,
      createdAt: new Date('2024-04-11'),
      scheme: 'sroc',
      status: 'ready',
      summer: false,
      toFinancialYearEnding
    }

    preSrocMatch = {
      id: '1933937f-2977-4892-b158-3f568f1c7c23',
      batchType: 'supplementary',
      billRunNumber: 1044,
      createdAt: new Date('2024-04-11'),
      scheme: 'alcs',
      status: 'ready',
      summer: false,
      toFinancialYearEnding: 2022
    }

    billRunQueryStub = {
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      whereIn: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis(),
      modifyGraph: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis()
    }
  })

  afterEach(async () => {
    vi.restoreAllMocks()
  })

  describe('when there is a matching SROC bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = vi
        .fn()
        // Find last annual bill run
        
        .mockResolvedValueOnce(lastAnnualMatch)
        // Find matching SROC
        
        .mockResolvedValueOnce(srocMatch)
        // Find matching PRESROC
        
        .mockResolvedValueOnce(null)

      vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
    })

    it('returns the match and determines that only the "old" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService(regionId)

      expect(result).toEqual({ matches: [srocMatch], toFinancialYearEnding: 2022, trigger: engineTriggers.old })
    })
  })

  describe('when there is a matching PRESROC bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = vi
        .fn()
        // Find last annual bill run
        
        .mockResolvedValueOnce(lastAnnualMatch)
        // Find matching SROC
        
        .mockResolvedValueOnce(null)
        // Find matching PRESROC
        
        .mockResolvedValueOnce(preSrocMatch)

      vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
    })

    it('returns the match and determines that only the "current" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService(regionId)

      expect(result).toEqual({ matches: [preSrocMatch], toFinancialYearEnding, trigger: engineTriggers.current })
    })
  })

  describe('when there is a matching SROC and PRESROC bill run', () => {
    beforeEach(() => {
      // NOTE: We change the batch types to highlight for supplementary we are checking live SROC annual and
      // supplementary bill runs and for PRESROC _any_ live bill run
      srocMatch.batchType = 'annual'
      preSrocMatch.batchType = 'two_part_tariff'

      billRunQueryStub.first = vi
        .fn()
        // Find last annual bill run
        
        .mockResolvedValueOnce(lastAnnualMatch)
        // Find matching SROC
        
        .mockResolvedValueOnce(srocMatch)
        // Find matching PRESROC
        
        .mockResolvedValueOnce(preSrocMatch)

      vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
    })

    it('returns both matches and determines that "neither" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService(regionId)

      expect(result).toEqual({
        matches: [srocMatch, preSrocMatch],
        toFinancialYearEnding,
        trigger: engineTriggers.neither
      })
    })
  })

  describe('when there are no matching bill runs', () => {
    beforeEach(() => {
      billRunQueryStub.first = vi
        .fn()
        // Find last annual bill run
        
        .mockResolvedValueOnce(lastAnnualMatch)
        // Find matching SROC
        
        .mockResolvedValueOnce(null)
        // Find matching PRESROC
        
        .mockResolvedValueOnce(null)

      vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
    })

    it('returns no matches and determines that "both" engines can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService(regionId)

      expect(result).toEqual({ matches: [], toFinancialYearEnding, trigger: engineTriggers.both })
    })
  })

  describe('when annual bill run for the current financial year is outstanding', () => {
    describe('because the last one was for FY 2024 (SROC)', () => {
      beforeEach(() => {
        lastAnnualMatch.toFinancialYearEnding = 2024

        billRunQueryStub.first = vi
          .fn()
          // Find last annual bill run
          
          .mockResolvedValueOnce(lastAnnualMatch)
          // Find matching SROC
          
          .mockResolvedValueOnce(null)
          // Find matching PRESROC
          
          .mockResolvedValueOnce(null)

        vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
      })

      it("determines the 'toFinancialEndYear' to be the outstanding bill run's but allows both to be triggered", async () => {
        const result = await DetermineBlockingSupplementaryService(regionId)

        expect(result).toEqual({ matches: [], toFinancialYearEnding: 2024, trigger: engineTriggers.both })
      })
    })
  })

  // NOTE: These would never happen in a 'real' environment
  describe('Non-production scenarios (do not exist in production)', () => {
    // In production all regions have 'sent' annual bill runs so a result would always be found to get a financial year
    // from
    describe('when there are no annual bill runs for the selected region', () => {
      beforeEach(() => {
        billRunQueryStub.first = vi
          .fn()
          // Find last annual bill run
          
          .mockResolvedValueOnce(null)
          // Find matching SROC
          
          .mockResolvedValueOnce(null)
          // Find matching PRESROC
          
          .mockResolvedValueOnce(null)

        vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
      })

      it("determines the 'toFinancialEndYear' to be 0 and that 'neither' engine can be triggered", async () => {
        const result = await DetermineBlockingSupplementaryService(regionId)

        expect(result).toEqual({ matches: [], toFinancialYearEnding: 0, trigger: engineTriggers.neither })
      })
    })

    // In production all regions have 'sent' annual bill runs for the SROC years. At worst it could be that this years
    // SROC annual has not been run, so last year's is the latest. But never only PRESROC.
    describe('when the last annual bill run for the selected region was for FY 2022 (PRESROC)', () => {
      beforeEach(() => {
        lastAnnualMatch.toFinancialYearEnding = 2022

        billRunQueryStub.first = vi
          .fn()
          // Find last annual bill run
          
          .mockResolvedValueOnce(lastAnnualMatch)
          // Find matching SROC
          
          .mockResolvedValueOnce(null)
          // Find matching PRESROC
          
          .mockResolvedValueOnce(null)

        vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
      })

      it("determines the 'toFinancialEndYear' to be the outstanding bill run's and only allows 'old' to be triggered", async () => {
        const result = await DetermineBlockingSupplementaryService(regionId)

        expect(result).toEqual({ matches: [], toFinancialYearEnding: 2022, trigger: engineTriggers.old })
      })
    })
  })
})
