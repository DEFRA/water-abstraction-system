'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach, after } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')

// Thing under test
const FetchReturnCyclesService = require('../../../../app/services/jobs/return-logs/fetch-return-cycles.service.js')

describe.skip('Fetch return cycles service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let allYearReturnCycle
  let clock
  let returnCycleEndDate
  let returnCycleStartDate
  let summerReturnCycle
  let testDate
  let previousAllYearReturnCycle
  let previousSummerReturnCycle

  before(async () => {
    allYearReturnCycle = await ReturnCycleHelper.select(0, false)
    previousAllYearReturnCycle = await ReturnCycleHelper.select(1, false)
    summerReturnCycle = await ReturnCycleHelper.select(1, true)
    previousSummerReturnCycle = await ReturnCycleHelper.select(2, true)
    clock = Sinon.useFakeTimers(new Date(`${year}-05-01`))
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(() => {
    clock.restore()
  })

  describe('the date is at the start of the all year cycle', () => {
    it('should return the correct all year return cycle UUID', async () => {
      returnCycleStartDate = new Date(allYearReturnCycle.startDate)
      testDate = new Date(`${returnCycleStartDate.getFullYear()}-${returnCycleStartDate.getMonth() + 1}-25`)


      allYearReturnCycle = await ReturnCycleHelper.selectByDate(testDate, false)
      summerReturnCycle = await ReturnCycleHelper.selectByDate(testDate, true)
      previousAllYearReturnCycle = await ReturnCycleHelper.selectByDate(1, false)
      previousSummerReturnCycle = await ReturnCycleHelper.select(2, true)



      const result = await FetchReturnCyclesService.go(testDate)

      expect(result).to.equal([{
        dueDate: summerReturnCycle.dueDate,
        endDate: summerReturnCycle.endDate,
        id: summerReturnCycle.id,
        startDate: summerReturnCycle.startDate,
        summer: summerReturnCycle.summer
      }, {
        dueDate: allYearReturnCycle.dueDate,
        endDate: allYearReturnCycle.endDate,
        id: allYearReturnCycle.id,
        startDate: allYearReturnCycle.startDate,
        summer: allYearReturnCycle.summer
      }])
    })
  })

  describe('when summer is false and the date is at the end of the previous cycle', () => {
    it('should return the correct all year return cycle UUID', async () => {
      summer = false
      returnCycleEndDate = new Date(previousAllYearReturnCycle.endDate)
      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)

      const result = await FetchReturnCyclesService.go(testDate, summer)

      expect(result).to.equal({
        dueDate: previousAllYearReturnCycle.dueDate,
        endDate: previousAllYearReturnCycle.endDate,
        id: previousAllYearReturnCycle.id,
        startDate: previousAllYearReturnCycle.startDate,
        summer: previousAllYearReturnCycle.summer
      })
    })
  })

  describe('when summer is false and the date is for a return cycle that has not been created yet', () => {
    it('should return undefined', async () => {
      summer = false
      returnCycleEndDate = new Date(allYearReturnCycle.endDate)
      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)

      const result = await FetchReturnCyclesService.go(`${year + 3}-01-01`, summer)

      expect(result).to.equal(undefined)
    })
  })

  describe('when summer is true and the date is at the start of the summer cycle', () => {
    it('should return the correct all year return cycle UUID', async () => {
      summer = true
      returnCycleStartDate = new Date(summerReturnCycle.startDate)
      testDate = new Date(`${returnCycleStartDate.getFullYear()}-${returnCycleStartDate.getMonth() + 1}-25`)

      const result = await FetchReturnCyclesService.go(testDate, summer)

      expect(result).to.equal({
        dueDate: summerReturnCycle.dueDate,
        endDate: summerReturnCycle.endDate,
        id: summerReturnCycle.id,
        startDate: summerReturnCycle.startDate,
        summer: summerReturnCycle.summer
      })
    })
  })

  describe('when summer is true and the date is at the end of the previous cycle', () => {
    it('should return the correct all year return cycle UUID', async () => {
      summer = true
      returnCycleEndDate = new Date(previousSummerReturnCycle.endDate)
      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)

      const result = await FetchReturnCyclesService.go(testDate, summer)

      expect(result).to.equal({
        dueDate: previousSummerReturnCycle.dueDate,
        endDate: previousSummerReturnCycle.endDate,
        id: previousSummerReturnCycle.id,
        startDate: previousSummerReturnCycle.startDate,
        summer: previousSummerReturnCycle.summer
      })
    })
  })

  describe('when summer is true and the date is for a return cycle that has not been created yet', () => {
    it('should return undefined', async () => {
      summer = true
      returnCycleEndDate = new Date(summerReturnCycle.endDate)
      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)

      const result = await FetchReturnCyclesService.go(`${year + 3}-01-01`, summer)

      expect(result).to.equal(undefined)
    })
  })
})
