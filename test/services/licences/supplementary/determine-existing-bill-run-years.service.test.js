// Test framework
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'

// Thing under test
import DetermineExistingBillRunYearsService from '../../../../src/services/licences/supplementary/determine-existing-bill-run-years.service.js'

describe('Determine Existing Bill Run Years Service', () => {
  describe('when passed a regionId and years', () => {
    const { id: regionId } = RegionHelper.select()
    const years = [2093, 2094]

    let billRun
    let billRunTwo
    let twoPartTariff

    describe('and the bill run type is two-part tariff', () => {
      beforeAll(() => {
        twoPartTariff = true
      })

      describe('when an annual two-part tariff bill run has not been created for those years', () => {
        beforeEach(async () => {
          // Add an annual bill run to check this doesn't get picked up when we are looking for twoPartTariff ones
          billRun = await BillRunHelper.add({
            batchType: 'annual',
            regionId,
            status: 'sent',
            toFinancialYearEnding: 2093
          })
          // Add an errored two-part tariff bill run to check this doesn't get picked up either
          billRunTwo = await BillRunHelper.add({
            batchType: 'two_part_tariff',
            regionId,
            status: 'error',
            toFinancialYearEnding: 2093
          })
        })

        afterEach(async () => {
          await billRun.$query().delete()
          await billRunTwo.$query().delete()
        })

        it('does not return any years', async () => {
          const result = await DetermineExistingBillRunYearsService(regionId, years, twoPartTariff)

          expect(result).toEqual([])
        })
      })

      describe('when an annual two-part tariff bill run has been created for those years', () => {
        beforeEach(async () => {
          billRun = await BillRunHelper.add({
            batchType: 'two_part_tariff',
            regionId,
            status: 'sent',
            toFinancialYearEnding: 2093
          })
          billRunTwo = await BillRunHelper.add({
            batchType: 'two_part_tariff',
            regionId,
            status: 'review',
            toFinancialYearEnding: 2094
          })
        })

        afterEach(async () => {
          await billRun.$query().delete()
          await billRunTwo.$query().delete()
        })

        it('returns the years that a bill run exists for', async () => {
          const result = await DetermineExistingBillRunYearsService(regionId, years, twoPartTariff)

          expect(result).toEqual([2093, 2094])
        })
      })
    })

    describe('and the bill run type is annual (two-part tariff is false)', () => {
      beforeAll(() => {
        twoPartTariff = false
      })

      describe('when an annual bill run has not been created for those years', () => {
        beforeEach(async () => {
          // Add an annual two-part tariff bill run to confirm we only match to non two-part tariff
          billRun = await BillRunHelper.add({
            batchType: 'two_part_tariff',
            regionId,
            status: 'sent',
            toFinancialYearEnding: 2093
          })
          // Add a cancelled annual bill run to check this doesn't get picked up either
          billRunTwo = await BillRunHelper.add({
            batchType: 'annual',
            regionId,
            status: 'cancel',
            toFinancialYearEnding: 2093
          })
        })

        afterEach(async () => {
          await billRun.$query().delete()
          await billRunTwo.$query().delete()
        })

        it('does not return any years', async () => {
          const result = await DetermineExistingBillRunYearsService(regionId, years, twoPartTariff)

          expect(result).toEqual([])
        })
      })

      describe('when an annual bill run has been created for those years', () => {
        beforeEach(async () => {
          billRun = await BillRunHelper.add({
            batchType: 'annual',
            regionId,
            status: 'sent',
            toFinancialYearEnding: 2093
          })
          billRunTwo = await BillRunHelper.add({
            batchType: 'annual',
            regionId,
            status: 'review',
            toFinancialYearEnding: 2094
          })
        })

        afterEach(async () => {
          await billRun.$query().delete()
          await billRunTwo.$query().delete()
        })

        it('returns the years that a bill run exists for', async () => {
          const result = await DetermineExistingBillRunYearsService(regionId, years, twoPartTariff)

          expect(result).toEqual([2093, 2094])
        })
      })
    })
  })
})
