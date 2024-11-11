'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test Helpers
const { cycleDueDateAsISO, cycleEndDateAsISO, cycleStartDateAsISO } = require('../../../../app/lib/return-cycle-dates.lib.js')

// Thing under test
const GenerateReturnCycleService = require('../../../../app/services/jobs/return-logs/generate-return-cycle.service.js')

describe('Generate return cycle service', () => {
  describe('when summer is true', () => {
    it('should create a summer return cycle with the correct values and return the id', async () => {
      const result = await GenerateReturnCycleService.go(true)

      expect(result.startDate).to.equal(cycleStartDateAsISO(true))
      expect(result.endDate).to.equal(cycleEndDateAsISO(true))
      expect(result.dueDate).to.equal(cycleDueDateAsISO(true))
      expect(result.summer).to.equal(true)
      expect(result.submittedInWrls).to.equal(true)
    })
  })

  describe('when summer is false', () => {
    it('should create an all year return cycle with the correct values and return the id', async () => {
      const result = await GenerateReturnCycleService.go(false)

      expect(result.startDate).to.equal(cycleStartDateAsISO(false))
      expect(result.endDate).to.equal(cycleEndDateAsISO(false))
      expect(result.dueDate).to.equal(cycleDueDateAsISO(false))
      expect(result.summer).to.equal(false)
      expect(result.submittedInWrls).to.equal(true)
    })
  })
})
