'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')

// Thing under test
const FetchReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-return-cycle.service.js')

describe('Fetch return cycle service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let allYearReturnCycle
  let clock
  let summerReturnCycle
  let previousAllYearReturnCycle
  let previousSummerReturnCycle
  let summer

  before(async () => {
    allYearReturnCycle = await ReturnCycleHelper.select(0, false)
    previousAllYearReturnCycle = await ReturnCycleHelper.select(1, false)
    summerReturnCycle = await ReturnCycleHelper.select(1, true)
    previousSummerReturnCycle = await ReturnCycleHelper.select(2, true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when summer is false', () => {
    before(() => {
      clock = Sinon.useFakeTimers(new Date(`${year}-05-01`))
      summer = false
    })

    after(() => {
      clock.restore()
    })

    describe('and the date is after the end of april', () => {
      it('should return the correct all year return cycle UUID', async () => {
        const result = await FetchReturnCycleService.go(`${year}-05-01`, summer)

        expect(result).to.equal({
          dueDate: allYearReturnCycle.dueDate,
          endDate: allYearReturnCycle.endDate,
          id: allYearReturnCycle.id,
          startDate: allYearReturnCycle.startDate,
          summer: allYearReturnCycle.summer
        })
      })
    })

    describe('and the date is before the end of april', () => {
      it('should return the correct all year return cycle UUID', async () => {
        const result = await FetchReturnCycleService.go(`${year}-01-01`, summer)

        expect(result).to.equal({
          dueDate: previousAllYearReturnCycle.dueDate,
          endDate: previousAllYearReturnCycle.endDate,
          id: previousAllYearReturnCycle.id,
          startDate: previousAllYearReturnCycle.startDate,
          summer: previousAllYearReturnCycle.summer
        })
      })
    })

    describe('and the date is for a return cycle that has not been created yet', () => {
      it('should return undefined', async () => {
        const result = await FetchReturnCycleService.go(`${year + 3}-01-01`, summer)

        expect(result).to.equal(undefined)
      })
    })
  })

  describe('when summer is true', () => {
    before(() => {
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-11-01`))
      summer = true
    })

    after(() => {
      clock.restore()
    })

    describe('and the date is after the end of october', () => {
      it('should return the correct summer return cycle UUID', async () => {
        const result = await FetchReturnCycleService.go(`${year - 1}-12-01`, summer)

        expect(result).to.equal({
          dueDate: summerReturnCycle.dueDate,
          endDate: summerReturnCycle.endDate,
          id: summerReturnCycle.id,
          startDate: summerReturnCycle.startDate,
          summer: summerReturnCycle.summer
        })
      })
    })

    describe('and the date is before the end of october', () => {
      it('should return the correct summer log cycle UUID', async () => {
        const result = await FetchReturnCycleService.go(`${year - 1}-09-01`, summer)

        expect(result).to.equal({
          dueDate: previousSummerReturnCycle.dueDate,
          endDate: previousSummerReturnCycle.endDate,
          id: previousSummerReturnCycle.id,
          startDate: previousSummerReturnCycle.startDate,
          summer: previousSummerReturnCycle.summer
        })
      })
    })

    describe('and the date is for the current return cycle and it has not been created yet', () => {
      it('should return undefined if the return cycle does not exist', async () => {
        const result = await FetchReturnCycleService.go(`${year + 3}-11-01`, summer)

        expect(result).to.equal(undefined)
      })
    })
  })
})
