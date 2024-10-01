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
  let currentAllYearReturnCycle
  let currentSummerReturnCycle
  let previousAllYearReturnCycle
  let previousSummerReturnCycle
  let summer

  before(async () => {
    currentAllYearReturnCycle = await ReturnCycleHelper.select(3)
    previousAllYearReturnCycle = await ReturnCycleHelper.select(5)
    currentSummerReturnCycle = await ReturnCycleHelper.select(2)
    previousSummerReturnCycle = await ReturnCycleHelper.select(4)
  })

  describe('when summer is false', () => {
    before(() => {
      summer = false
    })

    describe('and the date is after the end of april', () => {
      it('should return the correct all year log cycle UUID', async () => {
        const result = await FetchReturnCycleService.go('2021-05-01', summer)

        expect(result).to.equal(currentAllYearReturnCycle.id)
      })
    })

    describe('and the date is before the end of april', () => {
      it('should return the correct all year log cycle UUID', async () => {
        const result = await FetchReturnCycleService.go('2021-01-01', summer)

        expect(result).to.equal(previousAllYearReturnCycle.id)
      })
    })

    describe('and the date is after the current cycle', () => {
      it('should return an empty array', async () => {
        const result = await FetchReturnCycleService.go('3031-01-01', summer)

        expect(result).to.be.undefined()
      })
    })
  })

  describe('when summer is true', () => {
    before(() => {
      summer = true
    })

    describe('and the date is after the end of october', () => {
      it('should return the correct summer log cycle UUID', async () => {
        const result = await FetchReturnCycleService.go('2021-12-01', summer)

        expect(result).to.equal(currentSummerReturnCycle.id)
      })
    })

    describe('and the date is before the end of october', () => {
      it('should return the correct summer log cycle UUID', async () => {
        const result = await FetchReturnCycleService.go('2021-09-01', summer)

        expect(result).to.equal(previousSummerReturnCycle.id)
      })
    })

    describe('and the date is after the current cycle', () => {
      it('should return an empty array', async () => {
        const result = await FetchReturnCycleService.go('3021-09-01', summer)

        expect(result).to.be.undefined()
      })
    })
  })
})
