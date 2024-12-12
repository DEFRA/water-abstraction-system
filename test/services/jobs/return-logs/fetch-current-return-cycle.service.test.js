'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')

// Thing under test
const FetchCurrentReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-current-return-cycle.service.js')

describe('Jobs - Return Logs - Fetch Current Return Cycle service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let allYearReturnCycle
  let clock
  let previousAllYearReturnCycle
  let previousSummerReturnCycle
  let summer
  let summerReturnCycle

  before(async () => {
    allYearReturnCycle = await ReturnCycleHelper.select(0, false)
    previousAllYearReturnCycle = await ReturnCycleHelper.select(1, false)
    summerReturnCycle = await ReturnCycleHelper.select(1, true)
    previousSummerReturnCycle = await ReturnCycleHelper.select(2, true)
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when summer is "false"', () => {
    before(() => {
      summer = false
    })

    describe('and the current date is after the end of April (20**-05-01)', () => {
      beforeEach(() => {
        clock = Sinon.useFakeTimers(new Date(`${year}-05-01`))
      })

      it('returns the correct "all year" return cycle', async () => {
        const result = await FetchCurrentReturnCycleService.go(summer)

        expect(result).to.equal({
          dueDate: allYearReturnCycle.dueDate,
          endDate: allYearReturnCycle.endDate,
          id: allYearReturnCycle.id,
          startDate: allYearReturnCycle.startDate,
          summer: allYearReturnCycle.summer
        })
      })
    })

    describe('and the current date is before the end of April (20**-01-01)', () => {
      beforeEach(() => {
        clock = Sinon.useFakeTimers(new Date(`${year}-01-01`))
      })

      it('returns the correct "all year" return cycle', async () => {
        const result = await FetchCurrentReturnCycleService.go(summer)

        expect(result).to.equal({
          dueDate: previousAllYearReturnCycle.dueDate,
          endDate: previousAllYearReturnCycle.endDate,
          id: previousAllYearReturnCycle.id,
          startDate: previousAllYearReturnCycle.startDate,
          summer: previousAllYearReturnCycle.summer
        })
      })
    })

    describe('and the current date is for a return cycle that has not yet been created', () => {
      beforeEach(() => {
        clock = Sinon.useFakeTimers(new Date(`${year + 3}-01-01`))
      })

      it('returns "undefined"', async () => {
        const result = await FetchCurrentReturnCycleService.go(summer)

        expect(result).to.equal(undefined)
      })
    })
  })

  describe('when summer is "true"', () => {
    before(() => {
      summer = true
    })

    describe('and the current date is after the end of October (20**-12-01)', () => {
      beforeEach(() => {
        clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))
      })

      it('returns the correct "summer" return cycle', async () => {
        const result = await FetchCurrentReturnCycleService.go(summer)

        expect(result).to.equal({
          dueDate: summerReturnCycle.dueDate,
          endDate: summerReturnCycle.endDate,
          id: summerReturnCycle.id,
          startDate: summerReturnCycle.startDate,
          summer: summerReturnCycle.summer
        })
      })
    })

    describe('and the current date is before the end of October (20**-09-01)', () => {
      beforeEach(() => {
        clock = Sinon.useFakeTimers(new Date(`${year - 1}-09-01`))
      })

      it('returns the correct "summer" log cycle', async () => {
        const result = await FetchCurrentReturnCycleService.go(summer)

        expect(result).to.equal({
          dueDate: previousSummerReturnCycle.dueDate,
          endDate: previousSummerReturnCycle.endDate,
          id: previousSummerReturnCycle.id,
          startDate: previousSummerReturnCycle.startDate,
          summer: previousSummerReturnCycle.summer
        })
      })
    })

    describe('and the current date is for a return cycle that has not yet been created', () => {
      beforeEach(() => {
        clock = Sinon.useFakeTimers(new Date(`${year + 3}-09-01`))
      })

      it('returns "undefined"', async () => {
        const result = await FetchCurrentReturnCycleService.go(summer)

        expect(result).to.equal(undefined)
      })
    })
  })
})
