'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')

// Thing under test
const CreateQuarterlyReturnCycleService = require('../../../../app/services/jobs/return-logs/create-quarterly-return-cycles.service.js')

describe('Jobs - Return Logs - Create Quarterly Return Cycles service', () => {
  let allYearReturnCycle
  let year

  before(async () => {
    allYearReturnCycle = await ReturnCycleHelper.select(0, false)
    year = allYearReturnCycle.startDate.getFullYear()
  })

  describe('and the return cycle has been provided', () => {
    it('creates the four quarterly return cycles', () => {
      const results = CreateQuarterlyReturnCycleService.go(allYearReturnCycle)

      expect(results).to.equal([
        {
          dueDate: new Date(`${year}-07-28`),
          endDate: new Date(`${year}-06-30`),
          id: allYearReturnCycle.id,
          startDate: new Date(`${year}-04-01`)
        },
        {
          dueDate: new Date(`${year}-10-28`),
          endDate: new Date(`${year}-09-30`),
          id: allYearReturnCycle.id,
          startDate: new Date(`${year}-07-01`)
        },
        {
          dueDate: new Date(`${year + 1}-01-28`),
          endDate: new Date(`${year}-12-31`),
          id: allYearReturnCycle.id,
          startDate: new Date(`${year}-10-01`)
        },
        {
          dueDate: new Date(`${year + 1}-04-28`),
          endDate: new Date(`${year + 1}-03-31`),
          id: allYearReturnCycle.id,
          startDate: new Date(`${year + 1}-01-01`)
        }
      ])
    })
  })

  describe('and no return cycle is provided', () => {
    it('returns an empty array', () => {
      const result = CreateQuarterlyReturnCycleService.go()

      expect(result).to.equal([])
    })
  })
})
