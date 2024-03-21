'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const DatabaseSupport = require('../../support/database.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const { determineCurrentFinancialYear } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchLiveBillRunsService = require('../../../app/services/bill-runs/fetch-live-bill-runs.service.js')

describe('Fetch Live Bill Runs service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()

  let financialYearEnding
  let regionId

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const region = await RegionHelper.add()
    regionId = region.id
  })

  describe('when there is a live bill run', () => {
    describe('and it is for the current year (SROC)', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          id: '1021c5bc-673c-48fa-98dd-733b46c84f90',
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
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        })
      })

      describe('and we are checking for a supplementary bill run for the current year', () => {
        beforeEach(async () => {
          financialYearEnding = currentFinancialYear.endDate.getFullYear()
        })

        it('returns the live bill run as the match', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, true)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
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
      beforeEach(async () => {
        await BillRunHelper.add({
          id: '1021c5bc-673c-48fa-98dd-733b46c84f90',
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
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        })
      })
    })

    describe('and it is for the last PRESROC year (PRESROC)', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          id: '1021c5bc-673c-48fa-98dd-733b46c84f90',
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
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
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
    it('returns no matches', async () => {
      const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

      expect(results).to.be.empty()
    })
  })
})
