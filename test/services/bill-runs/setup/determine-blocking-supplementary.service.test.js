'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Thing under test
const DetermineBlockingSupplementaryService = require('../../../../app/services/bill-runs/setup/determine-blocking-supplementary.service.js')

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
      billRunQueryStub.first = Sinon.stub()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching SROC
        .onSecondCall()
        .resolves(srocMatch)
        // Find matching PRESROC
        .onThirdCall()
        .resolves(null)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns the match and determines that only the "old" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId)

      expect(result).to.equal({ matches: [srocMatch], toFinancialYearEnding, trigger: engineTriggers.old })
    })
  })

  describe('when there is a matching PRESROC bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching SROC
        .onSecondCall()
        .resolves(null)
        // Find matching PRESROC
        .onThirdCall()
        .resolves(preSrocMatch)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns the match and determines that only the "current" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId)

      expect(result).to.equal({ matches: [preSrocMatch], toFinancialYearEnding, trigger: engineTriggers.current })
    })
  })

  describe('when there is a matching SROC and PRESROC bill run', () => {
    beforeEach(() => {
      // NOTE: We change the batch types to highlight that for supplementary we are checking for _any_ live bill run
      srocMatch.batchType = 'annual'
      preSrocMatch.batchType = 'two_part_tariff'

      billRunQueryStub.first = Sinon.stub()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching SROC
        .onSecondCall()
        .resolves(srocMatch)
        // Find matching PRESROC
        .onThirdCall()
        .resolves(preSrocMatch)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns both matches and determines that "neither" engine can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId)

      expect(result).to.equal({
        matches: [srocMatch, preSrocMatch],
        toFinancialYearEnding,
        trigger: engineTriggers.neither
      })
    })
  })

  describe('when there are no matching bill runs', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching SROC
        .onSecondCall()
        .resolves(null)
        // Find matching PRESROC
        .onThirdCall()
        .resolves(null)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns no matches and determines that "both" engines can be triggered', async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId)

      expect(result).to.equal({ matches: [], toFinancialYearEnding, trigger: engineTriggers.both })
    })
  })

  describe('when the last annual bill run for the region was not for the current financial year (it is outstanding)', () => {
    beforeEach(() => {
      lastAnnualMatch.toFinancialYearEnding = 2024

      billRunQueryStub.first = Sinon.stub()
        // Find last annual bill run
        .onFirstCall()
        .resolves(lastAnnualMatch)
        // Find matching SROC
        .onSecondCall()
        .resolves(null)
        // Find matching PRESROC
        .onThirdCall()
        .resolves(null)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it("determines the 'toFinancialEndYear' to be the outstanding bill run's", async () => {
      const result = await DetermineBlockingSupplementaryService.go(regionId)

      expect(result).to.equal({ matches: [], toFinancialYearEnding: 2024, trigger: engineTriggers.both })
    })
  })

  // NOTE: This would never happen in a 'real' environment. All regions have 'sent' annual bill runs so a result would
  // always be found
  describe('Non-production scenarios (do not exist in production)', () => {
    describe('when the last annual bill run for the region was not for the current financial year (it is outstanding)', () => {
      beforeEach(() => {
        billRunQueryStub.first = Sinon.stub()
          // Find last annual bill run
          .onFirstCall()
          .resolves(null)
          // Find matching SROC
          .onSecondCall()
          .resolves(null)
          // Find matching PRESROC
          .onThirdCall()
          .resolves(null)

        Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
      })

      it("determines the 'toFinancialEndYear' to be 0 and that 'neither' engine can be triggered", async () => {
        const result = await DetermineBlockingSupplementaryService.go(regionId)

        expect(result).to.equal({ matches: [], toFinancialYearEnding: 0, trigger: engineTriggers.neither })
      })
    })
  })
})
