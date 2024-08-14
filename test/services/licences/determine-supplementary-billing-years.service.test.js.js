'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const DetermineSupplementaryBillingYearsService = require('../../../app/services/licences/determine-supplementary-billing-years.service.js')

describe('Determine Supplementary Billing Years Service', () => {
  let startDate
  let endDate
  let clock
  let testDate

  beforeEach(() => {
    testDate = new Date('2024-03-31')
    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when given a start date beginning before April', () => {
    beforeEach(() => {
      startDate = new Date('2023-03-20')
    })

    describe('and no end date', () => {
      beforeEach(() => {
        endDate = null
      })

      it('takes todays date for the end date and returns the financial year ends between the two dates', () => {
        const result = DetermineSupplementaryBillingYearsService.go(startDate, endDate)

        expect(result).to.equal([2023, 2024])
      })
    })

    describe('and an end date beginning before April', () => {
      beforeEach(() => {
        endDate = new Date('2024-03-20')
      })

      it('returns the financial year ends between the two dates', () => {
        const result = DetermineSupplementaryBillingYearsService.go(startDate, endDate)

        expect(result).to.equal([2023, 2024])
      })
    })

    describe('and an end date beginning after April', () => {
      beforeEach(() => {
        endDate = new Date('2024-04-20')
      })

      it('returns the financial year ends between the two dates', () => {
        const result = DetermineSupplementaryBillingYearsService.go(startDate, endDate)

        expect(result).to.equal([2023, 2024, 2025])
      })
    })
  })

  describe('when given a start date beginning after April', () => {
    beforeEach(() => {
      startDate = new Date('2022-04-20')
    })

    describe('and no end date', () => {
      beforeEach(() => {
        endDate = null
      })

      it('takes todays date for the end date and returns the financial year ends between the two dates', () => {
        const result = DetermineSupplementaryBillingYearsService.go(startDate, endDate)

        expect(result).to.equal([2023, 2024])
      })
    })

    describe('and an end date beginning before April', () => {
      beforeEach(() => {
        endDate = new Date('2023-03-20')
      })

      it('returns  the financial year ends between the two dates', () => {
        const result = DetermineSupplementaryBillingYearsService.go(startDate, endDate)

        expect(result).to.equal([2023])
      })
    })

    describe('and an end date beginning after April', () => {
      beforeEach(() => {
        endDate = new Date('2023-04-20')
      })

      it('returns  the financial year ends between the two dates', () => {
        const result = DetermineSupplementaryBillingYearsService.go(startDate, endDate)

        expect(result).to.equal([2023, 2024])
      })
    })
  })
})
