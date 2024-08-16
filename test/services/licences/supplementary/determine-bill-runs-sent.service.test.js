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
const DetermineBillRunsSentService = require('../../../../app/services/licences/supplementary/determine-bill-runs-sent.service.js')

describe('Determine Bill Runs Sent Service', () => {
  let years
  let region

  beforeEach(() => {
    region = RegionHelper.select()

    years = [2023, 2024]
  })

  describe('when given a regionId', () => {
    describe('and an array of years', () => {
      describe('and an annual two-part tariff bill run has not been sent for those years', () => {
        it('does not return the years a bill run has been sent', async () => {
          const result = await DetermineBillRunsSentService.go(region.id, years)

          expect(result).to.equal([])
        })
      })

      describe('and an annual two-part tariff bill run has been sent for those years', () => {
        beforeEach(async () => {
          await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId: region.id })
          await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId: region.id, toFinancialYearEnding: 2024 })
        })

        it('returns the years a bill run has been sent', async () => {
          const result = await DetermineBillRunsSentService.go(region.id, years)

          expect(result).to.equal([2023, 2024])
        })
      })
    })
  })
})
