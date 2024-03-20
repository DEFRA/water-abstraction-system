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

// Thing under test
const FetchLiveBillRunsService = require('../../../app/services/bill-runs/fetch-live-bill-runs.service.js')

describe('Fetch Live Bill Runs service', () => {
  let financialYearEnding
  let regionId

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const region = await RegionHelper.add()
    regionId = region.id
  })

  describe('when there is a live bill run', () => {
    beforeEach(() => {
      financialYearEnding = 2024
    })

    describe('and it matches the financial year end requested', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          id: '1021c5bc-673c-48fa-98dd-733b46c84f90',
          regionId,
          batchType: 'two_part_tariff',
          status: 'review',
          toFinancialYearEnding: financialYearEnding,
          scheme: 'sroc'
        })
      })

      describe('and we are not setting up a supplementary bill run (supplementary is false)', () => {
        it('returns the live bill run as the match', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        })
      })

      describe('and we are setting up a supplementary bill run (supplementary is true)', () => {
        describe('and there is also a live bill run in 2022 (last year for PRESROC)', () => {
          beforeEach(async () => {
            await BillRunHelper.add({
              id: 'b65bb671-8961-4d0c-93f4-d19e1998e778',
              regionId,
              batchType: 'supplementary',
              status: 'ready',
              toFinancialYearEnding: 2022,
              scheme: 'alcs'
            })
          })

          it('returns multiple live bill run matches', async () => {
            const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, true)

            expect(results).to.have.length(2)
            expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
            expect(results[1].id).to.equal('b65bb671-8961-4d0c-93f4-d19e1998e778')
          })
        })

        describe('and there are no PRESROC live bill runs', () => {
          it('returns just the live bill run as the match', async () => {
            const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

            expect(results).to.have.length(1)
            expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
          })
        })
      })
    })

    describe('but it does not match the financial year end requested', () => {
      beforeEach(async () => {
        financialYearEnding = 2024

        await BillRunHelper.add({
          id: '1021c5bc-673c-48fa-98dd-733b46c84f90',
          regionId,
          batchType: 'two_part_tariff',
          status: 'review',
          toFinancialYearEnding: 2023,
          scheme: 'sroc'
        })
      })

      describe('and we are not setting up a supplementary bill run (supplementary is false)', () => {
        it('returns no matches', async () => {
          const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

          expect(results).to.be.empty()
        })
      })

      describe('and we are setting up a supplementary bill run (supplementary is true)', () => {
        describe('and there is also a live bill run in 2022 (last year for PRESROC)', () => {
          beforeEach(async () => {
            await BillRunHelper.add({
              id: 'b65bb671-8961-4d0c-93f4-d19e1998e778',
              regionId,
              batchType: 'supplementary',
              status: 'ready',
              toFinancialYearEnding: 2022,
              scheme: 'alcs'
            })
          })

          it('returns just the PRESROC live bill as the match', async () => {
            const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, true)

            expect(results).to.have.length(1)
            expect(results[0].id).to.equal('b65bb671-8961-4d0c-93f4-d19e1998e778')
          })
        })

        describe('and there are no PRESROC live bill runs', () => {
          it('returns no matches', async () => {
            const results = await FetchLiveBillRunsService.go(regionId, financialYearEnding, false)

            expect(results).to.be.empty()
          })
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
