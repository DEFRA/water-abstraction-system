'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code
const Sinon = require('sinon')

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitSubmissionService = require('../../../../app/services/return-logs/setup/submit-submission.service.js')

describe('Return Logs - Setup - Submit Submission service', () => {
  let fetchSessionStub
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
      returnReference: ReturnRequirementHelper.generateReference()
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
    Sinon.stub(DeleteSessionDal, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and the user has selected "Enter and submit"', () => {
        beforeEach(() => {
          payload = { journey: 'enterReturn' }
        })

        it('saves the submitted option to the session and returns the redirect as "reported"', async () => {
          const result = await SubmitSubmissionService.go(session.id, payload)

          expect(session.journey).to.equal('enterReturn')
          expect(result.redirect).to.equal('reported')
          expect(session.$update.called).to.be.true()
        })
      })

      describe('and the user has selected "Enter a nil return"', () => {
        beforeEach(() => {
          payload = { journey: 'nilReturn' }
        })

        it('saves the submitted option to the session and returns the redirect as "check"', async () => {
          const result = await SubmitSubmissionService.go(session.id, payload)

          expect(session.journey).to.equal('nilReturn')
          expect(result.redirect).to.equal('check')
          expect(session.$update.called).to.be.true()
        })
      })

      describe('and the user has selected "Record receipt"', () => {
        beforeEach(async () => {
          payload = { journey: 'recordReceipt' }

          returnLog = await ReturnLogHelper.add({ id: returnLogId })
        })

        it('returns the redirect as "confirm-received", updates the return log as "received", deletes the session, and returns the redirect as "confirm-received"', async () => {
          const result = await SubmitSubmissionService.go(session.id, payload)

          const refreshedReturnLog = await returnLog.$query()

          // Check the status has been set to received
          expect(refreshedReturnLog.status).to.equal('received')

          // Check the received date has been set to what was recorded in the session
          expect(refreshedReturnLog.receivedDate).to.equal(new Date(session.receivedDate))

          // Check the updated at timestamp has been set
          expect(refreshedReturnLog.updatedAt).to.be.greaterThan(returnLog.updatedAt)

          // Check the session got deleted
          expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()

          // Check the redirect takes will tell the controller to redirect to the return received confirmation page
          expect(result.redirect).to.equal('confirm-received')
        })
      })

      describe('and the check page had been visited previously', () => {
        beforeEach(() => {
          payload = { journey: 'enterReturn' }

          sessionData = { beenReceived: false, checkPageVisited: true, returnLogId, returnReference: '1234' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('updates "checkPageVisited" to false in the session data', async () => {
          await SubmitSubmissionService.go(session.id, payload)

          expect(session.checkPageVisited).to.be.false()
          expect(session.$update.called).to.be.true()
        })
      })
    })

    describe('with an invalid payload because the user has not selected anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('includes an error for the radio form element', async () => {
        const result = await SubmitSubmissionService.go(session.id, payload)

        expect(result.error.errorList).to.equal([
          { href: '#journey', text: 'Select what you want to do with this return' }
        ])
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitSubmissionService.go(session.id, payload)

        expect(result).to.equal({
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
