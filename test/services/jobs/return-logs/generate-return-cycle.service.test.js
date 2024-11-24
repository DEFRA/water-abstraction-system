'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test Helpers
const {
  cycleDueDateAsISO,
  cycleEndDateAsISO,
  cycleStartDateAsISO
} = require('../../../../app/lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../../../app/models/return-cycle.model.js')

// Thing under test
const GenerateReturnCycleService = require('../../../../app/services/jobs/return-logs/generate-return-cycle.service.js')

describe('Generate return cycle service', () => {
  describe('when summer is true', () => {
    it('should create a summer return cycle with the correct values and return the id', async () => {
      const result = await GenerateReturnCycleService.go(true)
      const returnCycle = await ReturnCycleModel.query().findById(result)

      expect(result).to.be.a.string()
      expect(returnCycle.startDate).to.equal(new Date(cycleStartDateAsISO(true)))
      expect(returnCycle.endDate).to.equal(new Date(cycleEndDateAsISO(true)))
      expect(returnCycle.dueDate).to.equal(new Date(cycleDueDateAsISO(true)))
      expect(returnCycle.summer).to.equal(true)
      expect(returnCycle.submittedInWrls).to.equal(true)
    })
  })

  describe('when summer is false', () => {
    it('should create an all year return cycle with the correct values and return the id', async () => {
      const result = await GenerateReturnCycleService.go(false)
      const returnCycle = await ReturnCycleModel.query().findById(result)

      expect(result).to.be.a.string()
      expect(returnCycle.startDate).to.equal(new Date(cycleStartDateAsISO(false)))
      expect(returnCycle.endDate).to.equal(new Date(cycleEndDateAsISO(false)))
      expect(returnCycle.dueDate).to.equal(new Date(cycleDueDateAsISO(false)))
      expect(returnCycle.summer).to.equal(false)
      expect(returnCycle.submittedInWrls).to.equal(true)
    })
  })
})
