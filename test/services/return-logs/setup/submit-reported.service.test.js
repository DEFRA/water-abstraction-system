'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitReportedService = require('../../../../app/services/return-logs/setup/submit-reported.service.js')

describe('Return Logs Setup - Submit Reported service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      data: {
        returnReference: '12345'
      }
    }

    session = await SessionHelper.add(sessionData)
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = { reported: 'meter-readings' }
      })

      it('saves the submitted option', async () => {
        await SubmitReportedService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.reported).to.equal('meter-readings')
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitReportedService.go(session.id, payload)

        expect(result).to.equal(
          {
            pageTitle: 'How was this return reported?',
            activeNavBar: 'search',
            reported: null,
            backLink: `/system/return-logs/setup/${session.id}/submission`,
            returnReference: '12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitReportedService.go(session.id, payload)

          expect(result.error).to.equal({ text: 'Select how this return was reported' })
        })
      })
    })
  })
})
