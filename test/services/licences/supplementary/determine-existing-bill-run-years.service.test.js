'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const DetermineExistingBillRunYearsService = require('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')

describe('Determine Existing Bill Run Years Service', () => {
  describe('when passed a regionId and years', () => {
    const { id: regionId } = RegionHelper.select(RegionHelper.BILL_RUN_REGION_INDEX)
    const years = [2023, 2024]

    let billRun
    let billRunTwo
    let twoPartTariff

    describe('and the bill run type is two-part tariff', () => {
      before(() => {
        twoPartTariff = true
      })

      describe('when an annual two-part tariff bill run has not been created for those years', () => {
        beforeEach(async () => {
          // Add an annual bill run to check this doesn't get picked up when we are looking for twoPartTariff ones
          billRun = await BillRunHelper.add({ batchType: 'annual', status: 'sent', regionId })
        })

        afterEach(async () => {
          await billRun.$query().delete()
        })

        it('does not return any years', async () => {
          const result = await DetermineExistingBillRunYearsService.go(regionId, years, twoPartTariff)

          expect(result).to.equal([])
        })
      })

      describe('when an annual two-part tariff bill run has been created for those years', () => {
        beforeEach(async () => {
          billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId })
          billRunTwo = await BillRunHelper.add({
            batchType: 'two_part_tariff',
            status: 'review',
            regionId,
            toFinancialYearEnding: 2024
          })
        })

        afterEach(async () => {
          await billRun.$query().delete()
          await billRunTwo.$query().delete()
        })

        it('returns the years that a bill run exists for', async () => {
          const result = await DetermineExistingBillRunYearsService.go(regionId, years, twoPartTariff)

          expect(result).to.equal([2023, 2024])
        })
      })
    })

    describe('and the bill run type is annual (two-part tariff is false)', () => {
      before(() => {
        twoPartTariff = false
      })

      describe('when an annual bill run has not been created for those years', () => {
        beforeEach(async () => {
          // Add an annual two-part tariff bill run to confirm we only match to non two-part tariff
          billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId })
        })

        afterEach(async () => {
          await billRun.$query().delete()
        })

        it('does not return any years', async () => {
          const result = await DetermineExistingBillRunYearsService.go(regionId, years, twoPartTariff)

          expect(result).to.equal([])
        })
      })

      describe('when an annual bill run has been created for those years', () => {
        beforeEach(async () => {
          billRun = await BillRunHelper.add({ batchType: 'annual', status: 'sent', regionId })
          billRunTwo = await BillRunHelper.add({
            batchType: 'annual',
            status: 'review',
            regionId,
            toFinancialYearEnding: 2024
          })
        })

        afterEach(async () => {
          await billRun.$query().delete()
          await billRunTwo.$query().delete()
        })

        it('returns the years that a bill run exists for', async () => {
          const result = await DetermineExistingBillRunYearsService.go(regionId, years, twoPartTariff)

          expect(result).to.equal([2023, 2024])
        })
      })
    })
  })
})
