'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const DetermineExistingBillRunYearsService = require('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')

const REGION_ANGLIAN_INDEX = 0
const REGION_MIDLANDS_INDEX = 1

describe('Determine Existing Bill Run Years Service', () => {
  const years = [2023, 2024]
  let region
  let twoPartTariff

  describe('when passed a regionId and years', () => {
    describe('and the bill run type is two-part tariff', () => {
      before(() => {
        twoPartTariff = true
        region = RegionHelper.select(REGION_ANGLIAN_INDEX)
      })

      describe('when an annual two-part tariff bill run has not been created for those years', () => {
        beforeEach(async () => {
          // Add an annual bill run to check this doesn't get picked up when we are looking for twoPartTariff ones
          await BillRunHelper.add({ batchType: 'annual', status: 'sent', regionId: region.id })
        })

        it('does not return any years', async () => {
          const result = await DetermineExistingBillRunYearsService.go(region.id, years, twoPartTariff)

          expect(result).to.equal([])
        })
      })

      describe('when an annual two-part tariff bill run has been created for those years', () => {
        beforeEach(async () => {
          await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId: region.id })
          await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'review', regionId: region.id, toFinancialYearEnding: 2024 })
        })

        it('returns the years that a bill run exists for', async () => {
          const result = await DetermineExistingBillRunYearsService.go(region.id, years, twoPartTariff)

          expect(result).to.equal([2023, 2024])
        })
      })
    })

    describe('and the bill run type is annual (two-part tariff is false)', () => {
      before(() => {
        twoPartTariff = false
        region = RegionHelper.select(REGION_MIDLANDS_INDEX)
      })

      describe('when an annual bill run has not been created for those years', () => {
        beforeEach(async () => {
          // Add an annual two-part tariff bill run to confirm we only match to non two-part tariff
          await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId: region.id })
        })

        it('does not return any years', async () => {
          const result = await DetermineExistingBillRunYearsService.go(region.id, years, twoPartTariff)

          expect(result).to.equal([])
        })
      })

      describe('when an annual bill run has been created for those years', () => {
        beforeEach(async () => {
          await BillRunHelper.add({ batchType: 'annual', status: 'sent', regionId: region.id })
          await BillRunHelper.add({ batchType: 'annual', status: 'review', regionId: region.id, toFinancialYearEnding: 2024 })
        })

        it('returns the years that a bill run exists for', async () => {
          const result = await DetermineExistingBillRunYearsService.go(region.id, years, twoPartTariff)

          expect(result).to.equal([2023, 2024])
        })
      })
    })
  })
})
