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
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSubmissionService = require('../../../../app/services/return-logs/setup/submit-submission.service.js')

describe('Return Logs - Setup - Submit Submission service', () => {
  let payload
  let returnLog
  let returnLogId
  let session

  beforeEach(async () => {
    returnLogId = ReturnLogHelper.generateReturnLogId()

    session = await SessionHelper.add({
      data: {
        beenReceived: false,
        receivedDateOptions: 'today',
        receivedDate: new Date('2025-02-14'),
        returnLogId,
        returnReference: ReturnRequirementHelper.generateReference()
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and the user has selected "Enter and submit"', () => {
        beforeEach(async () => {
          payload = { journey: 'enter-return' }
        })

        it('saves the submitted option to the session and returns the redirect as "reported"', async () => {
          const result = await SubmitSubmissionService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.journey).to.equal('enter-return')
          expect(result.redirect).to.equal('reported')
        })
      })

      describe('and the user has selected "Enter a nil return"', () => {
        beforeEach(async () => {
          payload = { journey: 'nil-return' }
        })

        it('saves the submitted option to the session and returns the redirect as "check"', async () => {
          const result = await SubmitSubmissionService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.journey).to.equal('nil-return')
          expect(result.redirect).to.equal('check')
        })
      })

      describe('and the user has selected "Record receipt"', () => {
        beforeEach(async () => {
          payload = { journey: 'record-receipt' }

          returnLog = await ReturnLogHelper.add({ id: returnLogId })
        })

        it('returns the redirect as "confirm-received", updates the return log as "received", deletes the session, and returns the redirect as "confirm-received"', async () => {
          const result = await SubmitSubmissionService.go(session.id, payload)

          const refreshedReturnLog = await returnLog.$query()

          // Check the status has been set to received
          expect(refreshedReturnLog.status).to.equal('received')

          // Check the received date has been set to what was recorded in the session
          expect(refreshedReturnLog.receivedDate).to.equal(new Date(session.data.receivedDate))

          // Check the updated at timestamp has been set
          expect(refreshedReturnLog.updatedAt).to.be.greaterThan(returnLog.updatedAt)

          // Check the session got deleted
          const refreshedSession = await session.$query()

          expect(refreshedSession).not.to.exist()

          // Check the redirect takes will tell the controller to redirect to the return received confirmation page
          expect(result.redirect).to.equal('confirm-received')
        })
      })

      describe('and the check page had been visited previously', () => {
        beforeEach(async () => {
          payload = { journey: 'enter-return' }

          session = await SessionHelper.add({
            data: { beenReceived: false, checkPageVisited: true, returnLogId, returnReference: '1234' }
          })
        })

        it('updates "checkPageVisited" to false in the session data', async () => {
          await SubmitSubmissionService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.checkPageVisited).to.be.false()
        })
      })
    })

    describe('with an invalid payload because the user has not selected anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('includes an error for the radio form element', async () => {
        const result = await SubmitSubmissionService.go(session.id, payload)

        expect(result.error).to.equal({ text: 'Select what you want to do with this return' })
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitSubmissionService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          backLink: `/system/return-logs/setup/${session.id}/received`,
          beenReceived: false,
          error: { text: 'Select what you want to do with this return' },
          journey: null,
          pageTitle: 'What do you want to do with this return?',
          caption: `Return reference ${session.returnReference}`
        })
      })
    })
  })
})
