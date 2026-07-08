// Test framework dependencies

// Test helpers
import { engineTriggers } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Thing under test
import DetermineBlockingTwoPartSupplementaryService from '../../../../app/services/bill-runs/setup/determine-blocking-two-part-supplementary.service.js'

describe('Bill Runs - Setup - Determine Blocking Two Part Supplementary Bill Run service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let billRunQueryStub
  let lastAnnualMatch
  let match
  let year

  beforeEach(() => {
    year = 2024

    lastAnnualMatch = {
      id: 'abd2733b-32c7-4b24-b32d-cefc96ca697a',
      toFinancialYearEnding: year
    }

    match = {
      id: 'aadb1af8-16d5-46c3-9b80-00a6201b8196',
      batchType: 'two_part_tariff',
      billRunNumber: 1045,
      createdAt: new Date('2024-04-11'),
      scheme: 'sroc',
      status: 'ready',
      summer: false,
      toFinancialYearEnding: year
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

  describe('when there is a live bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = vi
        .fn()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching bill run
        .onSecondCall()
        .resolves(match)

      vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
    })

    it('returns the match and determines that neither engine can be triggered', async () => {
      const result = await DetermineBlockingTwoPartSupplementaryService(regionId, year)

      expect(result).toEqual({ matches: [match], toFinancialYearEnding: year, trigger: engineTriggers.neither })
    })
  })

  describe('when there is no live bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = vi
        .fn()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching bill run
        .onSecondCall()
        .resolves(null)

      vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
    })

    it('returns no matches and determines that the "current" engine can be triggered', async () => {
      const result = await DetermineBlockingTwoPartSupplementaryService(regionId, year)

      expect(result).toEqual({ matches: [], toFinancialYearEnding: year, trigger: engineTriggers.current })
    })
  })

  describe('when the two-part tariff annual bill run for the region has not been run for the selected year (it is outstanding)', () => {
    beforeEach(() => {
      billRunQueryStub.first = vi.fn().mockResolvedValue(null)

      vi.spyOn(BillRunModel, 'query').mockReturnValue(billRunQueryStub)
    })

    it("determines the 'toFinancialEndYear' to be 0 and that 'neither' engine can be triggered", async () => {
      const result = await DetermineBlockingTwoPartSupplementaryService(regionId, year)

      expect(result).toEqual({ matches: [], toFinancialYearEnding: 0, trigger: engineTriggers.neither })
    })
  })
})
