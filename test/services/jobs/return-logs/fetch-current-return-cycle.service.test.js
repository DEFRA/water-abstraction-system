'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { determineCycleEndDate } = require('../../../../app/lib/return-cycle-dates.lib.js')
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')

// Thing under test
const FetchCurrentReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-current-return-cycle.service.js')

describe('Jobs - Return Logs - Fetch Current Return Cycle service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let allYearReturnCycle
  let clock
  let summer
  let summerReturnCycle

  before(async () => {
    allYearReturnCycle = await ReturnCycleHelper.select(0, false)
    summerReturnCycle = await ReturnCycleHelper.select(0, true)
  })

  describe('when summer is "false"', () => {
    before(() => {
      summer = false
    })

    it('returns the correct "all year" return cycle details', async () => {
      const result = await FetchCurrentReturnCycleService.go(false)

      expect(result).to.equal({
        dueDate: allYearReturnCycle.dueDate,
        endDate: allYearReturnCycle.endDate,
        id: allYearReturnCycle.id,
        startDate: allYearReturnCycle.startDate,
        summer: allYearReturnCycle.summer
      })
    })

    describe('and the current date is for a return cycle that has not yet been created', () => {
      before(() => {
        clock = Sinon.useFakeTimers(new Date(`${year + 3}-01-01`))
      })

      it('returns "undefined"', async () => {
        const result = await FetchCurrentReturnCycleService.go(summer)

        expect(result).to.equal(undefined)
      })

      after(() => {
        clock.restore()
      })
    })
  })

  describe('when summer is "true"', () => {
    before(() => {
      summer = true
    })

    it('returns the correct "summer" return cycle details', async () => {
      const result = await FetchCurrentReturnCycleService.go(summer)

      expect(result).to.equal({
        dueDate: summerReturnCycle.dueDate,
        endDate: summerReturnCycle.endDate,
        id: summerReturnCycle.id,
        startDate: summerReturnCycle.startDate,
        summer: summerReturnCycle.summer
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

      after(() => {
        clock.restore()
      })
    })
  })
})
