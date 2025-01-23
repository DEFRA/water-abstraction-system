'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSubmissionService = require('../../../../app/services/return-logs/setup/submit-submission.service.js')

describe('Return Logs Setup - Submit Submission service', () => {
  let payload
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { beenReceived: false, returnReference: '1234' } })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { journey: 'enter-return' }
      })

      it('saves and returns the submitted option', async () => {
        await SubmitSubmissionService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.journey).to.equal('enter-return')
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
