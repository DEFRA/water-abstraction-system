'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitStartReadingService = require('../../../../app/services/return-logs/setup/submit-start-reading.service.js')

describe('Return Logs Setup - Submit Start Reading service', () => {
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
        payload = { startReading: '15600' }
      })

      it('saves the submitted option', async () => {
        await SubmitStartReadingService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.startReading).to.equal('15600')
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStartReadingService.go(session.id, payload)

        expect(result).to.equal(
          {
            pageTitle: 'Enter the start meter reading',
            activeNavBar: 'search',
            startReading: null,
            backLink: `/system/return-logs/setup/${session.id}/check`,
            returnReference: '12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitStartReadingService.go(session.id, payload)

          expect(result.error).to.equal({ text: 'Enter a start meter reading' })
        })
      })
    })
  })
})
