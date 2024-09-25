'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')

// Thing under test
const FetchReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-return-cycle.service.js')

describe('Fetch return cycle service', () => {
  const today = new Date()

  // use an older date range so as not to conflict with other unit tests testing creating current cycles
  const tenYearsAgo = new Date(`${today.getFullYear() - 10}-01-01`)

  let currentAllYearReturnCycle
  let currentSummerReturnCycle
  let previousAllYearReturnCycle
  let previousSummerReturnCycle

  before(async () => {
    currentAllYearReturnCycle = await ReturnCycleHelper.add({
      endDate: `${tenYearsAgo.getFullYear() + 1}-03-31`,
      isSummer: false,
      startDate: `${tenYearsAgo.getFullYear()}-04-01`
    })
    previousAllYearReturnCycle = await ReturnCycleHelper.add({
      endDate: `${tenYearsAgo.getFullYear()}-03-31`,
      isSummer: false,
      startDate: `${tenYearsAgo.getFullYear() - 1}-04-01`
    })
    currentSummerReturnCycle = await ReturnCycleHelper.add({
      endDate: `${tenYearsAgo.getFullYear() + 1}-10-31`,
      isSummer: true,
      startDate: `${tenYearsAgo.getFullYear()}-11-01`
    })
    previousSummerReturnCycle = await ReturnCycleHelper.add({
      endDate: `${tenYearsAgo.getFullYear()}-10-31`,
      isSummer: true,
      startDate: `${tenYearsAgo.getFullYear() - 1}-11-01`
    })
  })

  describe('when summer is false and the date is after the end of april', () => {
    it('should return the correct all year log cycle UUID', async () => {
      const result = await FetchReturnCycleService.go(`${tenYearsAgo.getFullYear()}-05-01`, false)

      expect(result).to.equal(currentAllYearReturnCycle.id)
    })
  })

  describe('when summer is false and the date is before the end of april', () => {
    it('should return the correct all year log cycle UUID', async () => {
      const result = await FetchReturnCycleService.go(`${tenYearsAgo.getFullYear()}-01-01`, false)

      expect(result).to.equal(previousAllYearReturnCycle.id)
    })
  })

  describe('when summer is false and the date is after the current cycle', () => {
    it('should return an empty arrya', async () => {
      const result = await FetchReturnCycleService.go(`${tenYearsAgo.getFullYear() + 2}-01-01`, false)

      expect(result).to.be.undefined()
    })
  })

  describe('when summer is true and the date is after the end of october', () => {
    it('should return the correct summer log cycle UUID', async () => {
      const result = await FetchReturnCycleService.go(`${tenYearsAgo.getFullYear()}-12-01`, true)

      expect(result).to.equal(currentSummerReturnCycle.id)
    })
  })

  describe('when summer is true and the date is before the end of october', () => {
    it('should return the correct summer log cycle UUID', async () => {
      const result = await FetchReturnCycleService.go(`${tenYearsAgo.getFullYear()}-09-01`, true)

      expect(result).to.equal(previousSummerReturnCycle.id)
    })
  })

  describe('when summer is true and the date is after the current cycle', () => {
    it('should return an empty array', async () => {
      const result = await FetchReturnCycleService.go(`${tenYearsAgo.getFullYear() + 2}-09-01`, true)

      expect(result).to.be.undefined()
    })
  })
})
