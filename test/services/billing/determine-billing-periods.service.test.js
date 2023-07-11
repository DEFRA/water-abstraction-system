'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const DetermineBillingPeriodsService = require('../../../app/services/billing/determine-billing-periods.service.js')

describe('Billing Periods service', () => {
  let clock
  let expectedResult
  let testDate

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when the date is in 2022 and falls within the 2022 financial year', () => {
    beforeEach(async () => {
      testDate = new Date('2022-04-01')
      expectedResult = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31')
      }

      clock = Sinon.useFakeTimers(testDate)
    })

    it('returns the expected date range', () => {
      const result = DetermineBillingPeriodsService.go()

      expect(result).to.have.length(1)
      expect(result[0]).to.equal(expectedResult)
    })
  })

  describe('when the date is in 2023 and falls within the 2022 financial year', () => {
    beforeEach(async () => {
      testDate = new Date('2023-03-01')
      expectedResult = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31')
      }

      clock = Sinon.useFakeTimers(testDate)
    })

    it('returns the expected date range', () => {
      const result = DetermineBillingPeriodsService.go()

      expect(result).to.have.length(1)
      expect(result[0]).to.equal(expectedResult)
    })
  })

  describe('when the date is in 2023 and falls within the 2023 financial year', () => {
    beforeEach(async () => {
      testDate = new Date('2023-10-10')
      expectedResult = [
        {
          startDate: new Date('2023-04-01'),
          endDate: new Date('2024-03-31')
        },
        {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }
      ]

      clock = Sinon.useFakeTimers(testDate)
    })

    it('returns the expected date range', () => {
      const result = DetermineBillingPeriodsService.go()

      expect(result).to.have.length(2)
      expect(result).to.equal(expectedResult)
    })
  })

  describe('when the date is in 2030 and falls within the 2030 financial year', () => {
    beforeEach(async () => {
      testDate = new Date('2030-10-10')
      expectedResult = [
        {
          startDate: new Date('2030-04-01'),
          endDate: new Date('2031-03-31')
        },
        {
          startDate: new Date('2029-04-01'),
          endDate: new Date('2030-03-31')
        },
        {
          startDate: new Date('2028-04-01'),
          endDate: new Date('2029-03-31')
        },
        {
          startDate: new Date('2027-04-01'),
          endDate: new Date('2028-03-31')
        },
        {
          startDate: new Date('2026-04-01'),
          endDate: new Date('2027-03-31')
        },
        {
          startDate: new Date('2025-04-01'),
          endDate: new Date('2026-03-31')
        }
      ]

      clock = Sinon.useFakeTimers(testDate)
    })

    it('returns the expected date range', () => {
      const result = DetermineBillingPeriodsService.go()

      expect(result).to.have.length(6)
      expect(result).to.equal(expectedResult)
    })
  })
})
