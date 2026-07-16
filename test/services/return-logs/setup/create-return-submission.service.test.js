// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ReturnLogHelper from '../../../support/helpers/return-log.helper.js'
import ReturnLogModel from '../../../../app/models/return-log.model.js'
import ReturnSubmissionHelper from '../../../support/helpers/return-submission.helper.js'
import ReturnSubmissionModel from '../../../../app/models/return-submission.model.js'
import { generateUUID, timestampForPostgres } from '../../../../app/lib/general.lib.js'

// Thing under test
import CreateReturnSubmissionService from '../../../../app/services/return-logs/setup/create-return-submission.service.js'

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
        returnId: ReturnLogHelper.generateReturnId(),
        returnLogId: generateUUID()
      }
    })

    describe('and no previous submission exists for this return log', () => {
      it('creates a new return submission and sets the version to 1', async () => {
        const result = await CreateReturnSubmissionService(metadata, session, timestamp, user)

        expect(result).toMatchObject({
          createdAt: timestamp,
          createdBy: user.userId,
          current: true,
          metadata,
          nilReturn: false,
          notes: 'TEST_NOTE',
          returnId: session.returnId,
          returnLogId: session.returnLogId,
          userId: user.username,
          userType: 'internal',
          version: 1
        })
        expect(result).toBeInstanceOf(ReturnSubmissionModel)
      })
    })

    describe('and a previous submission exists for this return log', () => {
      beforeEach(async () => {
        const returnSubmission = await ReturnSubmissionHelper.add()

        session.returnLogId = returnSubmission.returnLogId
      })

      it('creates a new return submission and sets the version to 2', async () => {
        const result = await CreateReturnSubmissionService(metadata, session, timestamp, user)

        expect(result).toMatchObject({
          createdAt: timestamp,
          createdBy: user.userId,
          current: true,
          metadata,
          nilReturn: false,
          notes: 'TEST_NOTE',
          returnId: session.returnId,
          returnLogId: session.returnLogId,
          userId: user.username,
          userType: 'internal',
          version: 2
        })
        expect(result).toBeInstanceOf(ReturnSubmissionModel)
      })

      it('marks the previous version as superseded', async () => {
        await CreateReturnSubmissionService(metadata, session, timestamp, user)

        const previousVersion = await ReturnSubmissionModel.query()
          .where('returnLogId', session.returnLogId)
          .where('version', 1)
          .first()

        expect(previousVersion.current).toBe(false)
      })
    })

    describe('and it is a nil return', () => {
      beforeEach(() => {
        session.journey = 'nilReturn'
      })

      it('sets the nillReturn field to true', async () => {
        const result = await CreateReturnSubmissionService(metadata, session, timestamp, user)

        expect(result.nilReturn).toBe(true)
      })
    })

    describe('and no note text is provided', () => {
      beforeEach(() => {
        session.note = null
      })

      it('leaves the notes field blank', async () => {
        const result = await CreateReturnSubmissionService(metadata, session, timestamp, user)

        expect(result.notes).toBeUndefined()
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
            await CreateReturnSubmissionService(metadata, session, timestamp, user, trx)
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

        expect(currentVersion).toBeUndefined()
        expect(previousVersion.current).toBe(true)
      })
    })
  })
})
