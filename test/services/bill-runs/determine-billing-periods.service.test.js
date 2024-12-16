'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DetermineBillingPeriodsService = require('../../../app/services/bill-runs/determine-billing-periods.service.js')

describe('Determine Billing Periods service', () => {
  let billRunType
  let financialYearEnding

  describe('when the bill run type is "annual"', () => {
    beforeEach(() => {
      billRunType = 'annual'
      financialYearEnding = 2025
    })

    it('returns a single billing period for the financial year provided', () => {
      const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

      expect(result).to.have.length(1)
      expect(result[0]).to.equal({
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31')
      })
    })
  })

  describe('when the bill run type is "two_part_tariff"', () => {
    beforeEach(() => {
      billRunType = 'two_part_tariff'
      financialYearEnding = 2024
    })

    it('returns a single billing period for the financial year provided', () => {
      const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

      expect(result).to.have.length(1)
      expect(result[0]).to.equal({
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31')
      })
    })
  })

  describe('when the bill run type is "supplementary"', () => {
    beforeEach(() => {
      billRunType = 'supplementary'
    })

    describe('and the financial year end provided is 5 years or less from the start of the SROC period', () => {
      beforeEach(() => {
        financialYearEnding = 2025
      })

      it('returns a billing period for each year from the start of the period', () => {
        const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

        expect(result).to.have.length(3)
        expect(result).to.equal([
          { startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31') },
          { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
          { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
        ])
      })
    })

    describe('and the financial year end provided is more than 5 years from the start of the SROC period', () => {
      beforeEach(() => {
        financialYearEnding = 2028
      })

      it('returns six billing periods ending with the financial year end provided', () => {
        const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

        expect(result).to.have.length(6)
        expect(result).to.equal([
          { startDate: new Date('2027-04-01'), endDate: new Date('2028-03-31') },
          { startDate: new Date('2026-04-01'), endDate: new Date('2027-03-31') },
          { startDate: new Date('2025-04-01'), endDate: new Date('2026-03-31') },
          { startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31') },
          { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
          { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
        ])
      })
    })

    // NOTE: This scenario would never happen, i.e. that we'd get a request to generate an SROC supplementary for a
    // PRESROC financial year. But it demonstrates the service will only generate billing periods that start in the
    // first year of SROC
    describe('and the financial year end provided is in the PRESROC period (non-production scenario)', () => {
      beforeEach(() => {
        financialYearEnding = 2022
      })

      it('returns no billing periods', () => {
        const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

        expect(result).to.be.empty()
      })
    })
  })
})
