'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../../../app/models/return-submission.model.js')

// Thing under test
const CreateReturnSubmissionService = require('../../../../app/services/return-logs/setup/create-return-submission.service.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')

describe('Return Logs - Setup - Create Return Submission service', () => {
  const userId = 'admin-internal@wrls.gov.uk'
  const metadata = {}
  const nilReturn = false

  let returnLogId

  describe('when called with valid data', () => {
    describe('and no previous submission exists for this return log', () => {
      beforeEach(() => {
        returnLogId = ReturnLogHelper.generateReturnLogId()
      })

      it('creates a new return submission and sets the version to 1', async () => {
        const result = await CreateReturnSubmissionService.go(returnLogId, userId, metadata, nilReturn)

        expect(result).to.equal(
          {
            current: true,
            metadata,
            nilReturn,
            returnLogId,
            userId,
            userType: 'internal',
            version: 1
          },
          { skip: ['id', 'createdAt'] }
        )
        expect(result).to.be.instanceOf(ReturnSubmissionModel)
      })
    })

    describe('and a previous submission exists for this return log', () => {
      beforeEach(async () => {
        const returnSubmission = await ReturnSubmissionHelper.add()

        returnLogId = returnSubmission.returnLogId
      })

      it('creates a new return submission and sets the version to 2', async () => {
        const result = await CreateReturnSubmissionService.go(returnLogId, userId, metadata, nilReturn)

        expect(result).to.equal(
          {
            current: true,
            metadata,
            nilReturn,
            returnLogId,
            userId,
            userType: 'internal',
            version: 2
          },
          { skip: ['id', 'createdAt'] }
        )
        expect(result).to.be.instanceOf(ReturnSubmissionModel)
      })

      it('marks the previous version as superseded', async () => {
        await CreateReturnSubmissionService.go(returnLogId, userId, metadata, nilReturn)

        const previousVersion = await ReturnSubmissionModel.query()
          .where('returnLogId', returnLogId)
          .where('version', 1)
          .first()

        expect(previousVersion.current).to.be.false()
      })
    })
  })

  describe('when called with a transaction', () => {
    beforeEach(async () => {
      const returnSubmission = await ReturnSubmissionHelper.add()

      returnLogId = returnSubmission.returnLogId
    })

    it('does not persist anything if an error occurs', async () => {
      try {
        await ReturnLogModel.transaction(async (trx) => {
          await CreateReturnSubmissionService.go(returnLogId, userId, metadata, nilReturn, trx)
          throw new Error()
        })
      } catch (_error) {
        // Ignore the error, we just want to test that nothing was persisted
      }

      const currentVersion = await ReturnSubmissionModel.query()
        .where('returnLogId', returnLogId)
        .where('version', 2)
        .first()

      const previousVersion = await ReturnSubmissionModel.query()
        .where('returnLogId', returnLogId)
        .where('version', 1)
        .first()

      expect(currentVersion).to.not.exist()
      expect(previousVersion.current).to.be.true()
    })
  })
})
