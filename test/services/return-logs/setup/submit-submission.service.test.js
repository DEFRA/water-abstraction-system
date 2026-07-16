// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import GenerateHelper from '../../../support/helpers/generate.helper.js'
import ReturnLogHelper from '../../../support/helpers/return-log.helper.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as DeleteSessionDal from '../../../../app/dal/delete-session.dal.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitSubmissionService from '../../../../app/services/return-logs/setup/submit-submission.service.js'

describe('Return Logs - Setup - Submit Submission service', () => {
  let payload
  let returnLog
  let returnLogId
  let session
  let sessionData

  beforeEach(() => {
    returnLogId = generateUUID()

    sessionData = {
      beenReceived: false,
      receivedDateOptions: 'today',
      receivedDate: new Date('2025-02-14'),
      returnLogId,
      returnReference: GenerateHelper.generateReference()
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and the user has selected "Enter and submit"', () => {
        beforeEach(() => {
          payload = { journey: 'enterReturn' }
        })

        it('saves the submitted option to the session and returns the redirect as "reported"', async () => {
          const result = await SubmitSubmissionService(session.id, payload)

          expect(session.journey).toEqual('enterReturn')
          expect(result.redirect).toEqual('reported')
          expect(session.$update).toHaveBeenCalled()
        })
      })

      describe('and the user has selected "Enter a nil return"', () => {
        beforeEach(() => {
          payload = { journey: 'nilReturn' }
        })

        it('saves the submitted option to the session and returns the redirect as "check"', async () => {
          const result = await SubmitSubmissionService(session.id, payload)

          expect(session.journey).toEqual('nilReturn')
          expect(result.redirect).toEqual('check')
          expect(session.$update).toHaveBeenCalled()
        })
      })

      describe('and the user has selected "Record receipt"', () => {
        beforeEach(async () => {
          payload = { journey: 'recordReceipt' }

          returnLog = await ReturnLogHelper.add({ id: returnLogId })
        })

        it('returns the redirect as "confirm-received", updates the return log as "received", deletes the session, and returns the redirect as "confirm-received"', async () => {
          const result = await SubmitSubmissionService(session.id, payload)

          const refreshedReturnLog = await returnLog.$query()

          // Check the status has been set to received
          expect(refreshedReturnLog.status).toEqual('received')

          // Check the received date has been set to what was recorded in the session
          expect(refreshedReturnLog.receivedDate).toEqual(new Date(session.receivedDate))

          // Check the updated at timestamp has been set
          expect(refreshedReturnLog.updatedAt.getTime()).toBeGreaterThan(returnLog.updatedAt.getTime())

          // Check the session got deleted
          expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)

          // Check the redirect takes will tell the controller to redirect to the return received confirmation page
          expect(result.redirect).toEqual('confirm-received')
        })
      })

      describe('and the check page had been visited previously', () => {
        beforeEach(() => {
          payload = { journey: 'enterReturn' }

          sessionData = { beenReceived: false, checkPageVisited: true, returnLogId, returnReference: '1234' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('updates "checkPageVisited" to false in the session data', async () => {
          await SubmitSubmissionService(session.id, payload)

          expect(session.checkPageVisited).toBe(false)
          expect(session.$update).toHaveBeenCalled()
        })
      })
    })

    describe('with an invalid payload because the user has not selected anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('includes an error for the radio form element', async () => {
        const result = await SubmitSubmissionService(session.id, payload)

        expect(result.error.errorList).toEqual([
          { href: '#journey', text: 'Select what you want to do with this return' }
        ])
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitSubmissionService(session.id, payload)

        expect(result).toEqual({
          backLink: { href: `/system/return-logs/setup/${session.id}/received`, text: 'Back' },
          beenReceived: false,
          error: {
            errorList: [{ href: '#journey', text: 'Select what you want to do with this return' }],
            journey: { text: 'Select what you want to do with this return' }
          },
          journey: null,
          pageTitle: 'What do you want to do with this return?',
          pageTitleCaption: `Return reference ${session.returnReference}`
        })
      })
    })
  })
})
