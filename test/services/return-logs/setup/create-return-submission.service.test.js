'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../../../app/models/return-submission.model.js')

// Thing under test
const CreateReturnSubmissionService = require('../../../../app/services/return-logs/setup/create-return-submission.service.js')

describe('Return Logs - Setup - Create Return Submission service', () => {
  const metadata = {}
  const timestamp = timestampForPostgres()
  const user = { id: 123456, username: 'admin-internal@wrls.gov.uk' }

  let session

  describe('when called with valid data', () => {
    beforeEach(() => {
      session = {
        journey: 'enterReturn',
        note: { content: 'TEST_NOTE' },
        returnLogId: ReturnLogHelper.generateReturnLogId()
      }
    })

    describe('and no previous submission exists for this return log', () => {
      it('creates a new return submission and sets the version to 1', async () => {
        const result = await CreateReturnSubmissionService.go(metadata, session, timestamp, user)

        expect(result).to.equal(
          {
            createdAt: timestamp,
            createdBy: user.id,
            current: true,
            metadata,
            nilReturn: false,
            notes: 'TEST_NOTE',
            returnLogId: session.returnLogId,
            userId: user.username,
            userType: 'internal',
            version: 1
          },
          { skip: ['id'] }
        )
        expect(result).to.be.instanceOf(ReturnSubmissionModel)
      })
    })

    describe('and a previous submission exists for this return log', () => {
      beforeEach(async () => {
        const returnSubmission = await ReturnSubmissionHelper.add()

        session.returnLogId = returnSubmission.returnLogId
      })

      it('creates a new return submission and sets the version to 2', async () => {
        const result = await CreateReturnSubmissionService.go(metadata, session, timestamp, user)

        expect(result).to.equal(
          {
            createdAt: timestamp,
            createdBy: user.id,
            current: true,
            metadata,
            nilReturn: false,
            notes: 'TEST_NOTE',
            returnLogId: session.returnLogId,
            userId: user.username,
            userType: 'internal',
            version: 2
          },
          { skip: ['id'] }
        )
        expect(result).to.be.instanceOf(ReturnSubmissionModel)
      })

      it('marks the previous version as superseded', async () => {
        await CreateReturnSubmissionService.go(metadata, session, timestamp, user)

        const previousVersion = await ReturnSubmissionModel.query()
          .where('returnLogId', session.returnLogId)
          .where('version', 1)
          .first()

        expect(previousVersion.current).to.be.false()
      })
    })

    describe('and it is a nil return', () => {
      beforeEach(() => {
        session.journey = 'nilReturn'
      })

      it('sets the nillReturn field to true', async () => {
        const result = await CreateReturnSubmissionService.go(metadata, session, timestamp, user)

        expect(result.nilReturn).to.be.true()
      })
    })

    describe('and no note text is provided', () => {
      beforeEach(() => {
        session.note = null
      })

      it('leaves the notes field blank', async () => {
        const result = await CreateReturnSubmissionService.go(metadata, session, timestamp, user)

        expect(result.notes).to.not.exist()
      })
    })

    describe('when called with a transaction', () => {
      beforeEach(async () => {
        const returnSubmission = await ReturnSubmissionHelper.add()

        session.returnLogId = returnSubmission.returnLogId
      })

      it('does not persist anything if an error occurs', async () => {
        try {
          await ReturnLogModel.transaction(async (trx) => {
            await CreateReturnSubmissionService.go(metadata, session, timestamp, user, trx)
            throw new Error()
          })
        } catch (_error) {
          // Ignore the error, we just want to test that nothing was persisted
        }

        const currentVersion = await ReturnSubmissionModel.query()
          .where('returnLogId', session.returnLogId)
          .where('version', 2)
          .first()

        const previousVersion = await ReturnSubmissionModel.query()
          .where('returnLogId', session.returnLogId)
          .where('version', 1)
          .first()

        expect(currentVersion).to.not.exist()
        expect(previousVersion.current).to.be.true()
      })
    })
  })
})
