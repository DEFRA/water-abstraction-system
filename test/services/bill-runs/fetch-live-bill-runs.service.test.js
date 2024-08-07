'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const { determineCurrentFinancialYear } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchLiveBillRunsService = require('../../../app/services/bill-runs/fetch-live-bill-runs.service.js')

describe('Fetch Live Bill Runs service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()

  let billRun
  let financialYearEnding
  let regionId

  describe('when there is a live bill run', () => {
    describe('and it is for the current year (SROC)', () => {
      before(async () => {
        const region = RegionHelper.select(0)

        regionId = region.id

        billRun = await BillRunHelper.add({
          regionId,
          batchType: 'supplementary',
          status: 'ready',
          toFinancialYearEnding: currentFinancialYear.endDate.getFullYear(),
          scheme: 'sroc'
        })
      })

      describe('and we are checking for an annual or two-part tariff bill run for the current year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear()
        })

        it('returns the live bill run as the match', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(billRun.id)
        })
      })

      describe('and we are checking for a supplementary bill run for the current year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear()
        })

        it('returns the live bill run as the match', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, true)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(billRun.id)
        })
      })

      describe('and we are checking for a backlog two-part tariff bill run for the previous year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear() - 1
        })

        it('returns no matches', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

          expect(results).to.be.empty()
        })
      })
    })

    describe('and it is for the previous year (SROC)', () => {
      before(async () => {
        const region = RegionHelper.select(1)

        regionId = region.id

        billRun = await BillRunHelper.add({
          regionId,
          batchType: 'supplementary',
          status: 'ready',
          toFinancialYearEnding: currentFinancialYear.endDate.getFullYear() - 1,
          scheme: 'sroc'
        })
      })

      describe('and we are checking for an annual or two-part tariff bill run for the current year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear()
        })

        it('returns no matches', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

          expect(results).to.be.empty()
        })
      })

      describe('and we are checking for a supplementary bill run for the current year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear()
        })

        it('returns no matches', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, true)

          expect(results).to.be.empty()
        })
      })

      describe('and we are checking for a backlog two-part tariff bill run for the previous year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear() - 1
        })

        it('returns the live bill run as the match', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(billRun.id)
        })
      })
    })

    describe('and it is for the last PRESROC year (PRESROC)', () => {
      before(async () => {
        const region = RegionHelper.select(2)

        regionId = region.id

        billRun = await BillRunHelper.add({
          regionId,
          batchType: 'supplementary',
          status: 'ready',
          toFinancialYearEnding: 2022,
          scheme: 'alcs'
        })
      })

      describe('and we are checking for an annual or two-part tariff bill run for the current year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear()
        })

        it('returns no matches', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

          expect(results).to.be.empty()
        })
      })

      describe('and we are checking for a supplementary bill run for the current year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear()
        })

        it('returns the live bill run as the match', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, true)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(billRun.id)
        })
      })

      describe('and we are checking for a backlog two-part tariff bill run for the previous year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear() - 1
        })

        it('returns no matches', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

          expect(results).to.be.empty()
        })
      })
    })
  })

  describe('when there are no live bill runs', () => {
    beforeEach(async () => {
      const region = RegionHelper.select(3)

      regionId = region.id
    })

    it('returns no matches', async () => {
      const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

      expect(results).to.be.empty()
    })
  })
})
