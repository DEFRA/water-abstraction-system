'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../../../app/models/return-submission.model.js')

// Thing under test
const CreateReturnSubmissionService = require('../../../../app/services/return-logs/setup/create-return-submission.service.js')

describe('Return Logs Setup - Create Return Submission service', () => {
  describe('when called with valid data', () => {
    it('creates a new return submission', async () => {
      const { returnLogId, userId, userType, metadata, nilReturn } = ReturnSubmissionHelper.defaults()

      const result = await CreateReturnSubmissionService.go(returnLogId, userId, userType, metadata, nilReturn)

      expect(result).to.include({
        returnLogId,
        userId,
        userType,
        metadata,
        nilReturn,
        current: true
      })
    })

    describe('and no previous submission exists for this return log', () => {
      it('sets the version to 1', async () => {
        const { returnLogId, userId, userType, metadata, nilReturn } = ReturnSubmissionHelper.defaults()

        const { version } = await CreateReturnSubmissionService.go(returnLogId, userId, userType, metadata, nilReturn)

        expect(version).to.equal(1)
      })
    })

    describe('and a previous submission exists for this return log', () => {
      let returnLogId

      beforeEach(async () => {
        const returnSubmission = await ReturnSubmissionHelper.add()
        returnLogId = returnSubmission.returnLogId
      })

      it('sets the version to 2', async () => {
        const { userId, userType, metadata, nilReturn } = ReturnSubmissionHelper.defaults()
        const result = await CreateReturnSubmissionService.go(returnLogId, userId, userType, metadata, nilReturn)

        expect(result.version).to.equal(2)
      })

      it('marks the previous version as superseded', async () => {
        const { userId, userType, metadata, nilReturn } = ReturnSubmissionHelper.defaults()
        await CreateReturnSubmissionService.go(returnLogId, userId, userType, metadata, nilReturn)

        const previousVersion = await ReturnSubmissionModel.query()
          .where('returnLogId', returnLogId)
          .where('version', 1)
          .first()

        expect(previousVersion.current).to.be.false()
      })
    })
  })
})
