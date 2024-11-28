'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCycleHelper = require('../../support/helpers/return-cycle.helper.js')

// Thing under test
const FetchReturnCyclesService = require('../../../app/services/return-logs/fetch-return-cycles.service.js')

describe('Fetch return cycles service', () => {
  let allYearReturnCycle
  let returnCycleStartDate
  let summerReturnCycle
  let testDate
  let previousSummerReturnCycle

  before(async () => {
    allYearReturnCycle = await ReturnCycleHelper.select(0, false)
    summerReturnCycle = await ReturnCycleHelper.select(1, true)
    previousSummerReturnCycle = await ReturnCycleHelper.select(2, true)
  })

  describe('the date is at the start of the all year cycle', () => {
    it('should return the correct return cycles', async () => {
      returnCycleStartDate = new Date(allYearReturnCycle.startDate)
      testDate = new Date(`${returnCycleStartDate.getFullYear()}-${returnCycleStartDate.getMonth() + 1}-25`)
      allYearReturnCycle = await ReturnCycleHelper.select(0, false)
      summerReturnCycle = await ReturnCycleHelper.select(0, true)
      previousSummerReturnCycle = await ReturnCycleHelper.select(1, true)

      const result = await FetchReturnCyclesService.go(testDate)

      expect(result).to.equal([
        {
          dueDate: summerReturnCycle.dueDate,
          endDate: summerReturnCycle.endDate,
          id: summerReturnCycle.id,
          startDate: summerReturnCycle.startDate,
          summer: summerReturnCycle.summer
        },
        {
          dueDate: previousSummerReturnCycle.dueDate,
          endDate: previousSummerReturnCycle.endDate,
          id: previousSummerReturnCycle.id,
          startDate: previousSummerReturnCycle.startDate,
          summer: previousSummerReturnCycle.summer
        },
        {
          dueDate: allYearReturnCycle.dueDate,
          endDate: allYearReturnCycle.endDate,
          id: allYearReturnCycle.id,
          startDate: allYearReturnCycle.startDate,
          summer: allYearReturnCycle.summer
        }
      ])
    })
  })

  describe('the date is in the future beyond the current return cycles', () => {
    it('should return an empty array', async () => {
      returnCycleStartDate = new Date(allYearReturnCycle.startDate)
      testDate = new Date(`${returnCycleStartDate.getFullYear() + 2}-${returnCycleStartDate.getMonth() + 1}-25`)

      const result = await FetchReturnCyclesService.go(testDate)

      expect(result).to.equal([])
    })
  })
})
