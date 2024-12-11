'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Thing under test
const DetermineFinancialYearEndService = require('../../../../app/services/bill-runs/setup/determine-financial-year-end.service.js')

describe('Bill Runs Setup Determine Financial Year End service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()
  const regionId = '42995569-bc1f-4330-8ed3-3b9c550c3cac'

  let currentFinancialYearEnd
  let selectedYear

  beforeEach(async () => {
    currentFinancialYearEnd = currentFinancialYear.endDate.getFullYear()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called for an annual bill run', () => {
    it('returns the current financial year end', async () => {
      const result = await DetermineFinancialYearEndService.go(regionId, 'annual')

      expect(result).to.equal(currentFinancialYearEnd)
    })
  })

  describe('when called for a two-part tariff annual bill run', () => {
    describe('and "year" is not provided', () => {
      it('returns the current financial year end', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'two_part_tariff')

        expect(result).to.equal(currentFinancialYearEnd)
      })
    })

    describe('and "year" is provided', () => {
      beforeEach(() => {
        selectedYear = 2023
      })

      it('returns the year provided', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'two_part_tariff', selectedYear)

        expect(result).to.equal(selectedYear)
      })
    })
  })

  describe('when called for an supplementary bill run', () => {
    describe('and the last "sent" annual bill run is in the current financial year', () => {
      beforeEach(async () => {
        Sinon.stub(BillRunModel, 'query').returns({
          select: Sinon.stub().returnsThis(),
          where: Sinon.stub().returnsThis(),
          orderBy: Sinon.stub().returnsThis(),
          limit: Sinon.stub().returnsThis(),
          first: Sinon.stub().resolves({
            id: '081e4f2c-7ff9-4aa6-b316-9384dbda7c39',
            toFinancialYearEnding: currentFinancialYearEnd
          })
        })
      })

      it('returns the current financial year end', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'supplementary')

        expect(result).to.equal(currentFinancialYearEnd)
      })
    })

    describe('and the last "sent" annual bill run is in the previous financial year', () => {
      beforeEach(async () => {
        Sinon.stub(BillRunModel, 'query').returns({
          select: Sinon.stub().returnsThis(),
          where: Sinon.stub().returnsThis(),
          orderBy: Sinon.stub().returnsThis(),
          limit: Sinon.stub().returnsThis(),
          first: Sinon.stub().resolves({
            id: '081e4f2c-7ff9-4aa6-b316-9384dbda7c39',
            toFinancialYearEnding: currentFinancialYearEnd - 1
          })
        })
      })

      it('returns the previous financial year end', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'supplementary')

        expect(result).to.equal(currentFinancialYearEnd - 1)
      })
    })

    describe('and the last "sent" bill run is not an annual', () => {
      beforeEach(async () => {
        Sinon.stub(BillRunModel, 'query').returns({
          select: Sinon.stub().returnsThis(),
          where: Sinon.stub().returnsThis(),
          orderBy: Sinon.stub().returnsThis(),
          limit: Sinon.stub().returnsThis(),
          first: Sinon.stub().resolves({
            id: '081e4f2c-7ff9-4aa6-b316-9384dbda7c39',
            toFinancialYearEnding: currentFinancialYearEnd - 1
          })
        })
      })

      it('ignores the other bill run and returns the financial year end of the first matching "sent" annual', async () => {
        const result = await DetermineFinancialYearEndService.go(regionId, 'supplementary')

        expect(result).to.equal(currentFinancialYearEnd - 1)
      })
    })
  })

  describe('Non-production scenarios (do not exist in production)', () => {
    describe('when called for an supplementary bill run', () => {
      // NOTE: This would never happen in a 'real' environment. But we often manipulate bill run dates whilst testing
      // to move annual bill runs out of the way. We would hate to break this ability so we have logic to only look at
      // sent annual bill runs with an end year less than or equal to the current financial end year
      describe('and the last "sent" annual bill run is in the next financial year', () => {
        beforeEach(async () => {
          Sinon.stub(BillRunModel, 'query').returns({
            select: Sinon.stub().returnsThis(),
            where: Sinon.stub().returnsThis(),
            orderBy: Sinon.stub().returnsThis(),
            limit: Sinon.stub().returnsThis(),
            first: Sinon.stub().resolves({
              id: '010d6238-a6a5-4c4b-b12f-4f95a68d8cee',
              toFinancialYearEnding: currentFinancialYearEnd
            })
          })
        })

        it('returns the financial year end of the bill run in the current year', async () => {
          const result = await DetermineFinancialYearEndService.go(regionId, 'supplementary')

          expect(result).to.equal(currentFinancialYearEnd)
        })
      })

      // NOTE: This would never happen in a 'real' environment. All regions have 'sent' annual bill runs so a result
      // would always be found
      describe('and there is no "sent" annual bill run for the same region', () => {
        beforeEach(async () => {
          Sinon.stub(BillRunModel, 'query').returns({
            select: Sinon.stub().returnsThis(),
            where: Sinon.stub().returnsThis(),
            orderBy: Sinon.stub().returnsThis(),
            limit: Sinon.stub().returnsThis(),
            first: Sinon.stub().resolves(undefined)
          })
        })

        it('throws an error', async () => {
          await expect(DetermineFinancialYearEndService.go(regionId, 'supplementary')).to.reject()
        })
      })
    })
  })
})
