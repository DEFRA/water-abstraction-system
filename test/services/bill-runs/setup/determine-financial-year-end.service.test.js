'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const DetermineFinancialYearEndService = require('../../../../app/services/bill-runs/setup/determine-financial-year-end.service.js')

describe('Bill Runs Setup Determine Financial Year End service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()

  let currentFinancialYearEnd
  let regionId

  beforeEach(async () => {
    await DatabaseSupport.clean()

    currentFinancialYearEnd = currentFinancialYear.endDate.getFullYear()

    const region = RegionHelper.select()

    regionId = region.id
  })

  describe('when called for an annual bill run', () => {
    it('returns the current financial year end', async () => {
      const result = await DetermineFinancialYearEndService.go(regionId, 'annual')

      expect(result).to.equal(currentFinancialYearEnd)
    })
  })

  describe('when called for a two-part tariff bill run', () => {
    describe('and "year" is not provided', () => {
      it('returns the current financial year end', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'two_part_tariff')

        expect(result).to.equal(currentFinancialYearEnd)
      })
    })

    describe('and "year" is provided', () => {
      it('returns the year provided', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'two_part_tariff', 2023)

        expect(result).to.equal(2023)
      })
    })
  })

  describe('when called for an supplementary bill run', () => {
    describe('and the last "sent" annual bill run is in the current financial year', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          batchType: 'annual', regionId, status: 'sent', toFinancialYearEnding: currentFinancialYearEnd
        })
      })

      it('returns the current financial year end', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'supplementary')

        expect(result).to.equal(currentFinancialYearEnd)
      })
    })

    describe('and the last "sent" annual bill run is in the previous financial year', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          batchType: 'annual', regionId, status: 'sent', toFinancialYearEnding: currentFinancialYearEnd - 1
        })
      })

      it('returns the previous financial year end', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'supplementary')

        expect(result).to.equal(currentFinancialYearEnd - 1)
      })
    })

    // NOTE: This would never happen in a 'real' environment. But we often manipulate bill run dates whilst testing
    // to move annual bill runs out of the way. We would hate to break this ability so we have logic to only look at
    // sent annual bill runs with an end year less than or equal to the current financial end year
    describe('and the last "sent" annual bill run is in the next financial year', () => {
      beforeEach(async () => {
        await Promise.all([
          BillRunHelper.add({
            batchType: 'annual', regionId, status: 'sent', toFinancialYearEnding: currentFinancialYearEnd
          }),
          BillRunHelper.add({
            batchType: 'annual', regionId, status: 'sent', toFinancialYearEnding: currentFinancialYearEnd + 1
          })
        ])
      })

      it('returns the financial year end of the bill run in the current year', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'supplementary')

        expect(result).to.equal(currentFinancialYearEnd)
      })
    })

    describe('and the last "sent" bill run is not an annual', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          batchType: 'two_part_tariff', regionId, status: 'sent', toFinancialYearEnding: currentFinancialYearEnd
        })
        await BillRunHelper.add({
          batchType: 'annual', regionId, status: 'sent', toFinancialYearEnding: currentFinancialYearEnd - 1
        })
      })

      it('ignores the other bill run and returns the financial year end of the first matching "sent" annual', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'supplementary')

        expect(result).to.equal(currentFinancialYearEnd - 1)
      })
    })

    // NOTE: This would never happen in a 'real' environment. All regions have 'sent' annual bill runs so a result
    // would always be found
    describe('and there is no "sent" annual bill run for the same region', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          batchType: 'annual',
          regionId: '576fde36-c19f-4e20-b852-7328d20d2aa0',
          status: 'sent',
          toFinancialYearEnding: currentFinancialYearEnd
        })
      })

      it('throws an error', async () => {
        await expect(DetermineFinancialYearEndService.go(regionId, 'supplementary')).to.reject()
      })
    })
  })
})
