'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ReturnCycleHelper = require('../support/helpers/return-cycle.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')

// Thing under test
const ReturnCycleModel = require('../../app/models/return-cycle.model.js')

describe('Return Cycle model', () => {
  const today = new Date()

  // use an older date range so as not to conflict with other unit tests testing creating current cycles
  const fifteenYearsAgo = new Date(`${today.getFullYear() - 15}-01-01`)
  let testRecord
  let testReturnLog

  before(async () => {
    testRecord = await ReturnCycleHelper.add({
      endDate: `${fifteenYearsAgo.getFullYear() + 1}-03-31`,
      isSummer: false,
      startDate: `${fifteenYearsAgo.getFullYear()}-04-01`
    })
    testReturnLog = await ReturnLogHelper.add({ returnCycleId: testRecord.id })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnCycleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnCycleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return log', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnCycleModel.query()
          .innerJoinRelated('returnLogs')

        expect(query).to.exist()
      })

      it('can eager load the return log', async () => {
        const result = await ReturnCycleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnLogs')

        expect(result).to.be.instanceOf(ReturnCycleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnLogs[0]).to.be.an.instanceOf(ReturnLogModel)
        expect(result.returnLogs[0]).to.equal(testReturnLog)
      })
    })
  })
})
