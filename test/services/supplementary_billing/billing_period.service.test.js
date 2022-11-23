'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BillingPeriodService = require('../../../app/services/supplementary_billing/billing_period.service')

describe('BillingPeriod service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when the date is in 2022 and falls within the 2022 financial year', () => {
    const testDate = new Date('2022-04-01')
    const expectedResult = {
      startDate: new Date('2022-04-01'),
      endDate: new Date('2023-03-31')
    }

    beforeEach(async () => {
      Sinon.stub(BillingPeriodService, '_currentDate').returns(testDate)
    })

    it('returns the expected date range', () => {
      const result = BillingPeriodService.go()

      expect(result.length).to.equal(1)
      expect(result[0]).to.equal(expectedResult)
    })
  })

  describe('when the date is in 2023 and falls within the 2022 financial year', () => {
    const testDate = new Date('2023-03-01')
    const expectedResult = {
      startDate: new Date('2022-04-01'),
      endDate: new Date('2023-03-31')
    }

    beforeEach(async () => {
      Sinon.stub(BillingPeriodService, '_currentDate').returns(testDate)
    })

    it('returns the expected date range', () => {
      const result = BillingPeriodService.go()

      expect(result.length).to.equal(1)
      expect(result[0]).to.equal(expectedResult)
    })
  })

  describe('when the date is in 2023 and falls within the 2023 financial year', () => {
    const testDate = new Date('2023-10-10')
    const expectedResult = {
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31')
    }

    beforeEach(async () => {
      Sinon.stub(BillingPeriodService, '_currentDate').returns(testDate)
    })

    it('returns the expected date range', () => {
      const result = BillingPeriodService.go()

      expect(result.length).to.equal(1)
      expect(result[0]).to.equal(expectedResult)
    })
  })

  describe('when the _currentDate function is not stubbed', () => {
    it('returns a date range', () => {
      const result = BillingPeriodService.go()

      expect(result.length).to.equal(1)
    })
  })
})
