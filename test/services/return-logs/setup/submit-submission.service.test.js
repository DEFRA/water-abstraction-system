'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSubmissionService = require('../../../../app/services/return-logs/setup/submit-submission.service.js')
const SessionModel = require('../../../../app/models/session.model.js')

describe.only('Return Logs Setup - Submit Submission service', () => {
  let payload
  let returnLog
  let session

  beforeEach(async () => {
    returnLog = await ReturnLogHelper.add()

    session = await SessionHelper.add({
      data: { beenReceived: false, returnReference: '1234', returnLogId: returnLog.id }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and a return has a status of "due"', () => {
        beforeEach(async () => {
          session.status = 'due'
          session.$update()
        })

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

          it('saves the submitted option to the session and returns the redirect as "reported"', async () => {
            const result = await SubmitSubmissionService.go(session.id, payload)

            const refreshedSession = await session.$query()

            expect(refreshedSession.journey).to.equal('nil-return')
            expect(result.redirect).to.equal('reported')
          })
        })

        describe.only('and the user has selected "Record receipt"', () => {
          beforeEach(async () => {
            payload = { journey: 'record-receipt' }
          })

          it('returns the redirect as "confirm-received"', async () => {
            const result = await SubmitSubmissionService.go(session.id, payload)

            expect(result.redirect).to.equal('confirm-received')
          })

          it('updates the matching return log instance status value to "completed" and the received date to the "session.receivedDate" value', async () => {
            await SubmitSubmissionService.go(session.id, payload)

            const query = await ReturnLogModel.query().findById(session.data.returnLogId)

            expect(query.status).to.equal('completed')
            expect(query.receivedDate).to.equal(returnLog.receivedDate)
          })

          it('deletes the session instance', async () => {
            await SubmitSubmissionService.go(session.id, payload)

            const query = await SessionModel.query().findById(session.id)

            expect(query).to.be.null()
          })
        })
      })

      describe('and a return does not have a status of "due"', () => {
        describe('and the user has selected "Enter and submit"', () => {
          beforeEach(() => {
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
          beforeEach(() => {
            payload = { journey: 'nil-return' }
          })

          it('saves the submitted option to the session and returns the redirect as "reported"', async () => {
            const result = await SubmitSubmissionService.go(session.id, payload)

            const refreshedSession = await session.$query()

            expect(refreshedSession.journey).to.equal('nil-return')
            expect(result.redirect).to.equal('reported')
          })
        })

        describe('and the user has selected "Record receipt"', () => {
          beforeEach(() => {
            payload = { journey: 'record-receipt' }
          })

          it('saves the submitted option to the session and returns the redirect as "confirmation"', async () => {
            const result = await SubmitSubmissionService.go(session.id, payload)

            const refreshedSession = await session.$query()

            expect(refreshedSession.journey).to.equal('record-receipt')
            expect(result.redirect).to.equal('reported')
          })
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
          returnReference: '1234'
        })
      })
    })
  })
})
