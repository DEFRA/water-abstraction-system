'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BillingPeriodService = require('../../../app/services/supplementary-billing/billing-period.service.js')

describe('Billing Period service', () => {
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
      const result = BillingPeriodService.go()

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
      const result = BillingPeriodService.go()

      expect(result).to.have.length(1)
      expect(result[0]).to.equal(expectedResult)
    })
  })

  // TODO: See notes in app/services/supplementary-billing/billing-period.service.js for reasons why this is skipped
  // and needs to be unskipped someday!
  describe.skip('when the date is in 2023 and falls within the 2023 financial year', () => {
    beforeEach(async () => {
      testDate = new Date('2023-10-10')
      expectedResult = {
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31')
      }

      clock = Sinon.useFakeTimers(testDate)
    })

    it('returns the expected date range', () => {
      const result = BillingPeriodService.go()

      expect(result).to.have.length(1)
      expect(result[0]).to.equal(expectedResult)
    })
  })
})
