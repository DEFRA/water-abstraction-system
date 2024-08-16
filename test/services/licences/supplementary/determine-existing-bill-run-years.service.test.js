'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const DetermineExistingBillRunYearsService = require('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')

describe.only('Determine Existing Bill Run Years Service', () => {
  let years
  let region

  describe('when passed a regionId and years', () => {
    beforeEach(() => {
      region = RegionHelper.select()

      years = [2023, 2024]
    })

    describe('and the bill run type is two-part tariff', () => {
      const twoPartTariff = true

      describe('when an annual two-part tariff bill run has not been created for those years', () => {
        beforeEach(async () => {
          // Add an annual bill run to check this doesnt get picked up when we are looking for twoPartTariff ones
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
  })
})
