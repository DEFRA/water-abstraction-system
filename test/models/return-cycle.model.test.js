'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const ReturnCycleHelper = require('../support/helpers/return-cycle.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')

// Thing under test
const ReturnCycleModel = require('../../app/models/return-cycle.model.js')

describe('Return Cycle model', () => {
  let testRecord
  let testReturnLogs

  before(async () => {
    testRecord = await ReturnCycleHelper.select()

    testReturnLogs = []
    for (let i = 0; i < 2; i++) {
      const returnLog = await ReturnLogHelper.add({ returnCycleId: testRecord.id })

      testReturnLogs.push(returnLog)
    }
  })

  after(async () => {
    await closeConnection()
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
        const query = await ReturnCycleModel.query().innerJoinRelated('returnLogs')

        expect(query).to.exist()
      })

      it('can eager load the return log', async () => {
        const result = await ReturnCycleModel.query().findById(testRecord.id).withGraphFetched('returnLogs')

        expect(result).to.be.instanceOf(ReturnCycleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnLogs).to.be.an.array()
        expect(result.returnLogs[0]).to.be.an.instanceOf(ReturnLogModel)
        expect(result.returnLogs).to.include(testReturnLogs[0])
        expect(result.returnLogs).to.include(testReturnLogs[1])
      })
    })
  })
})
