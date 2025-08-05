'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const FetchLiveBillRunService = require('../../../../app/services/bill-runs/setup/fetch-live-bill-run.service.js')

// Thing under test
const DetermineBlockingTwoPartSupplementaryService = require('../../../../app/services/bill-runs/setup/determine-blocking-two-part-supplementary.service.js')

describe('Bill Runs - Setup - Determine Blocking Two Part Supplementary Bill Run service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let billRunQueryStub
  let fetchLiveBillRunStub
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
      select: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis(),
      whereIn: Sinon.stub().returnsThis(),
      orderBy: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis(),
      modifyGraph: Sinon.stub().returnsThis(),
      limit: Sinon.stub().returnsThis()
    }

    fetchLiveBillRunStub = Sinon.stub(FetchLiveBillRunService, 'go')
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when there is a live bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching bill run
        .onSecondCall()
        .resolves(match)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns the match and determines that neither engine can be triggered', async () => {
      const result = await DetermineBlockingTwoPartSupplementaryService.go(regionId, year)

      expect(result).to.equal({ matches: [match], toFinancialYearEnding: year, trigger: engineTriggers.neither })
    })
  })

  describe('when there is no live bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching bill run
        .onSecondCall()
        .resolves(null)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns no matches and determines that the "current" engine can be triggered', async () => {
      const result = await DetermineBlockingTwoPartSupplementaryService.go(regionId, year)

      expect(result).to.equal({ matches: [], toFinancialYearEnding: year, trigger: engineTriggers.current })
    })
  })

  describe('when the two-part tariff annual bill run for the region has not been run for the selected year (it is outstanding)', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub().resolves(null)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it("determines the 'toFinancialEndYear' to be 0 and that 'neither' engine can be triggered", async () => {
      const result = await DetermineBlockingTwoPartSupplementaryService.go(regionId, year)

      expect(result).to.equal({ matches: [], toFinancialYearEnding: 0, trigger: engineTriggers.neither })
    })
  })
})
