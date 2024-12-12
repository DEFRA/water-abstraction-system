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
const FetchLiveBillRunService = require('../../../../app/services/bill-runs/setup/fetch-live-bill-run.service.js')

// Thing under test
const DetermineBlockingTwoPartSupplementaryService = require('../../../../app/services/bill-runs/setup/determine-blocking-two-part-supplementary.service.js')

describe('Bill Runs Setup Determine Blocking Two Part Supplementary Bill Run service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let fetchLiveBillRunStub
  let match
  let toFinancialYearEnding

  beforeEach(() => {
    toFinancialYearEnding = 2024

    match = {
      id: 'aadb1af8-16d5-46c3-9b80-00a6201b8196',
      batchType: 'supplementary',
      billRunNumber: 1045,
      createdAt: new Date('2024-04-11'),
      scheme: 'sroc',
      status: 'ready',
      summer: false,
      toFinancialYearEnding
    }

    fetchLiveBillRunStub = Sinon.stub(FetchLiveBillRunService, 'go')
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when there is a live bill run', () => {
    beforeEach(() => {
      fetchLiveBillRunStub.resolves(match)
    })

    it('returns the match and determines that neither engine can be triggered', async () => {
      const result = await DetermineBlockingTwoPartSupplementaryService.go(regionId, toFinancialYearEnding)

      expect(result).to.equal({ matches: [match], toFinancialYearEnding, trigger: engineTriggers.neither })
    })
  })

  describe('when there is no live bill run', () => {
    beforeEach(() => {
      fetchLiveBillRunStub.resolves(null)
    })

    it('returns no matches and determines that the "current" engine can be triggered', async () => {
      const result = await DetermineBlockingTwoPartSupplementaryService.go(regionId, toFinancialYearEnding)

      expect(result).to.equal({ matches: [], toFinancialYearEnding, trigger: engineTriggers.current })
    })
  })
})
