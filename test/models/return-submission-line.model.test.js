'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnSubmissionLineHelper = require('../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionHelper = require('../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../app/models/return-submission.model.js')

// Thing under test
const ReturnSubmissionLineModel = require('../../app/models/return-submission-line.model.js')

describe('Return Submission Line model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReturnSubmissionLineHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReturnSubmissionLineModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnSubmissionLineModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return submission', () => {
      let testReturnSubmission

      beforeEach(async () => {
        testReturnSubmission = await ReturnSubmissionHelper.add()
        testRecord = await ReturnSubmissionLineHelper.add({ returnSubmissionId: testReturnSubmission.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnSubmissionLineModel.query().innerJoinRelated('returnSubmission')

        expect(query).to.exist()
      })

      it('can eager load the return submission', async () => {
        const result = await ReturnSubmissionLineModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnSubmission')

        expect(result).to.be.instanceOf(ReturnSubmissionLineModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnSubmission).to.be.an.instanceOf(ReturnSubmissionModel)
        expect(result.returnSubmission).to.equal(testReturnSubmission)
      })
    })
  })
})
