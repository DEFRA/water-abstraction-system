'use strict'

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchLiveBillRunsService = require('../../../../app/services/bill-runs/setup/fetch-live-bill-run.service.js')

describe('Bill Runs - Setup - Fetch Live Bill Run service', () => {
  const differentRegion = RegionHelper.select(0)
  const matchingRegion = RegionHelper.select(1)
  const toFinancialYearEnding = 2025

  let differentRegionBillRun
  let nonMatchingBillRunIds
  let matchingBillRun
  let notLiveBillRun
  let sameRegionBillRun

  beforeAll(async () => {
    differentRegionBillRun = await BillRunHelper.add({
      toFinancialYearEnding,
      regionId: differentRegion.id,
      status: 'ready'
    })

    matchingBillRun = await BillRunHelper.add({
      toFinancialYearEnding,
      regionId: matchingRegion.id,
      status: 'ready'
    })

    notLiveBillRun = await BillRunHelper.add({
      toFinancialYearEnding,
      regionId: matchingRegion.id,
      status: 'sent'
    })

    sameRegionBillRun = await BillRunHelper.add({
      toFinancialYearEnding: 2022,
      regionId: matchingRegion.id,
      scheme: 'alcs',
      status: 'ready'
    })

    nonMatchingBillRunIds = [differentRegionBillRun.id, notLiveBillRun.id, sameRegionBillRun.id]
  })

  afterAll(async () => {
    await Promise.all([
      differentRegionBillRun.$query().delete(),
      matchingBillRun.$query().delete(),
      notLiveBillRun.$query().delete(),
      sameRegionBillRun.$query().delete()
    ])
  })

  describe('when there is a "live" bill run', () => {
    describe('for the requested region', () => {
      describe('with a matching financial year ending', () => {
        it('returns the match', async () => {
          const result = await FetchLiveBillRunsService(matchingRegion.id, toFinancialYearEnding)

          expect(result).toEqual({
            id: matchingBillRun.id,
            batchType: matchingBillRun.batchType,
            billRunNumber: matchingBillRun.billRunNumber,
            createdAt: matchingBillRun.createdAt,
            region: {
              id: matchingRegion.id,
              displayName: matchingRegion.displayName
            },
            scheme: matchingBillRun.scheme,
            status: matchingBillRun.status,
            summer: matchingBillRun.summer,
            toFinancialYearEnding: matchingBillRun.toFinancialYearEnding
          })
        })
      })

      describe('but with a different matching financial year ending', () => {
        it('is not returned as the match', async () => {
          const result = await FetchLiveBillRunsService(matchingRegion.id, toFinancialYearEnding)

          expect(nonMatchingBillRunIds).not.toContainEqual(result.id)
        })
      })
    })

    describe('for a different region', () => {
      it('is not returned as the match', async () => {
        const result = await FetchLiveBillRunsService(matchingRegion.id, toFinancialYearEnding)

        expect(nonMatchingBillRunIds).not.toContainEqual(result.id)
      })
    })
  })

  describe('when there is a "non-live" bill run', () => {
    it('is not returned as the match', async () => {
      const result = await FetchLiveBillRunsService(matchingRegion.id, toFinancialYearEnding)

      expect(nonMatchingBillRunIds).not.toContainEqual(result.id)
    })
  })
})
