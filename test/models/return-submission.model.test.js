'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const ReturnSubmissionLineHelper = require('../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionLineModel = require('../../app/models/return-submission-line.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../support/helpers/return-submission.helper.js')

// Thing under test
const ReturnSubmissionModel = require('../../app/models/return-submission.model.js')

describe('Return Submission model', () => {
  let testRecord

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReturnSubmissionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReturnSubmissionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnSubmissionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return log', () => {
      let testReturnLog

      beforeEach(async () => {
        testReturnLog = await ReturnLogHelper.add()
        testRecord = await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnSubmissionModel.query().innerJoinRelated('returnLog')

        expect(query).to.exist()
      })

      it('can eager load the return log', async () => {
        const result = await ReturnSubmissionModel.query().findById(testRecord.id).withGraphFetched('returnLog')

        expect(result).to.be.instanceOf(ReturnSubmissionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnLog).to.be.an.instanceOf(ReturnLogModel)
        expect(result.returnLog).to.equal(testReturnLog)
      })
    })

    describe('when linking to return submission lines', () => {
      let testLines

      beforeEach(async () => {
        testRecord = await ReturnSubmissionHelper.add()
        const { id: returnSubmissionId } = testRecord

        testLines = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the lines table means you cannot have 2 records with the same returnSubmissionId,
          // startDate and endDate
          const returnSubmissionLine = await ReturnSubmissionLineHelper.add({
            returnSubmissionId,
            startDate: new Date(2022, 11, 1 + i),
            endDate: new Date(2022, 11, 2 + i)
          })

          testLines.push(returnSubmissionLine)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnSubmissionModel.query().innerJoinRelated('returnSubmissionLines')

        expect(query).to.exist()
      })

      it('can eager load the return submission lines', async () => {
        const result = await ReturnSubmissionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnSubmissionLines')

        expect(result).to.be.instanceOf(ReturnSubmissionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnSubmissionLines).to.be.an.array()
        expect(result.returnSubmissionLines[0]).to.be.an.instanceOf(ReturnSubmissionLineModel)
        expect(result.returnSubmissionLines).to.include(testLines[0])
        expect(result.returnSubmissionLines).to.include(testLines[1])
      })
    })
  })
})
