'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const FetchLiveBillRunService = require('../../../../app/services/bill-runs/setup/fetch-live-bill-run.service.js')

// Thing under test
const DetermineBlockingAnnualService = require('../../../../app/services/bill-runs/setup/determine-blocking-annual.service.js')

describe('Bill Runs Setup Determine Blocking Annual Bill Run service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'
  const toFinancialYearEnding = currentFinancialYear.endDate.getFullYear()

  let billRunQueryStub
  let fetchLiveBillRunStub
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
      select: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis(),
      whereNotIn: Sinon.stub().returnsThis(),
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

  describe('when there is a matching bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub().resolves(match)

      Sinon.stub(BillRunModel, 'query').returns(billRunQueryStub)
    })

    it('returns the match and determines that neither engine can be triggered', async () => {
      const result = await DetermineBlockingAnnualService.go(regionId)

      expect(result).to.equal({ matches: [match], toFinancialYearEnding, trigger: engineTriggers.neither })
    })

    it('does not bother to check for live bill runs', async () => {
      await DetermineBlockingAnnualService.go(regionId, toFinancialYearEnding)

      expect(fetchLiveBillRunStub.called).to.be.false()
    })
  })

  describe('when there is no matching bill run', () => {
    beforeEach(() => {
      billRunQueryStub.first = Sinon.stub().resolves(null)
    })

    describe('and no live bill run', () => {
      beforeEach(() => {
        fetchLiveBillRunStub.resolves(null)
      })

      it('returns no matches and determines that the "current" engine can be triggered', async () => {
        const result = await DetermineBlockingAnnualService.go(regionId)

        expect(result).to.equal({ matches: [], toFinancialYearEnding, trigger: engineTriggers.current })
      })
    })

    describe('but there is a live bill run', () => {
      beforeEach(() => {
        match.batchType = 'supplementary'
        match.status = 'ready'

        fetchLiveBillRunStub.resolves(match)
      })

      it('returns the match and determines that neither engine can be triggered', async () => {
        const result = await DetermineBlockingAnnualService.go(regionId)

        expect(result).to.equal({ matches: [match], toFinancialYearEnding, trigger: engineTriggers.neither })
      })
    })
  })
})
