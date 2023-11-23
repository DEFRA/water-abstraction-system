'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../app/models/return-submission.model.js')

// Thing under test
const ReturnLogModel = require('../../app/models/return-log.model.js')

describe('Return Log model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ReturnLogHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnLogModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnLogModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return submissions', () => {
      let returnSubmissions

      beforeEach(async () => {
        const { id: returnLogId } = testRecord

        returnSubmissions = []
        for (let i = 0; i < 2; i++) {
          const version = i
          const returnSubmission = await ReturnSubmissionHelper.add({ returnLogId, version })
          returnSubmissions.push(returnSubmission)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnLogModel.query()
          .innerJoinRelated('returnSubmissions')

        expect(query).to.exist()
      })

      it('can eager load the return submissions', async () => {
        const result = await ReturnLogModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnSubmissions')

        expect(result).to.be.instanceOf(ReturnLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnSubmissions).to.be.an.array()
        expect(result.returnSubmissions[0]).to.be.an.instanceOf(ReturnSubmissionModel)
        expect(result.returnSubmissions).to.include(returnSubmissions[0])
        expect(result.returnSubmissions).to.include(returnSubmissions[1])
      })
    })
  })
})
