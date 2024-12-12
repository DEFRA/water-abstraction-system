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

// Thing under test
const DetermineBlockingSupplementaryService = require('../../../../app/services/bill-runs/setup/determine-blocking-supplementary.service.js')

describe('Bill Runs Setup Determine Blocking Supplementary Bill Run service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let billRunQueryStub
  let preSrocMatch
  let srocMatch
  let toFinancialYearEnding

  beforeEach(() => {
    toFinancialYearEnding = 2025

    srocMatch = {
      id: 'aadb1af8-16d5-46c3-9b80-00a6201b8196',
      batchType: 'supplementary',
      billRunNumber: 1045,
      createdAt: new Date('2024-04-11'),
      scheme: 'sroc',
      status: 'ready',
      summer: false,
      toFinancialYearEnding: 2025
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
      select: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis(),
      whereNotIn: Sinon.stub().returnsThis(),
      orderBy: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis(),
      modifyGraph: Sinon.stub().returnsThis(),
      limit: Sinon.stub().returnsThis()
    }
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when there is a matching SROC bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub().onFirstCall().resolves(srocMatch).onSecondCall().resolves(null)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns the match and determines that only the "old" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId, toFinancialYearEnding)

      expect(result).to.equal({ matches: [srocMatch], toFinancialYearEnding, trigger: engineTriggers.old })
    })
  })

  describe('when there is a matching PRESROC bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub().onFirstCall().resolves(null).onSecondCall().resolves(preSrocMatch)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns the match and determines that only the "current" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId, toFinancialYearEnding)

      expect(result).to.equal({ matches: [preSrocMatch], toFinancialYearEnding, trigger: engineTriggers.current })
    })
  })

  describe('when there is a matching SROC and PRESROC bill run', () => {
    beforeEach(() => {
      // NOTE: We change the batch types to highlight that for supplementary we are checking for _any_ live bill run
      srocMatch.batchType = 'annual'
      preSrocMatch.batchType = 'two_part_tariff'

      billRunQueryStub.first = Sinon.stub().onFirstCall().resolves(srocMatch).onSecondCall().resolves(preSrocMatch)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns both matches and determines that "neither" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId, toFinancialYearEnding)

      expect(result).to.equal({
        matches: [srocMatch, preSrocMatch],
        toFinancialYearEnding,
        trigger: engineTriggers.neither
      })
    })
  })

  describe('when there are no matching bill runs', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub().onFirstCall().resolves(null).onSecondCall().resolves(null)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns no matches and determines that "both" engines can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId, toFinancialYearEnding)

      expect(result).to.equal({ matches: [], toFinancialYearEnding, trigger: engineTriggers.both })
    })
  })
})
