'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitUnitsService = require('../../../../app/services/return-logs/setup/submit-units.service.js')

describe('Return Logs Setup - Submit Units service', () => {
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
        payload = { units: 'litres' }
      })

      it('saves the submitted option', async () => {
        await SubmitUnitsService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.units).to.equal('litres')
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitUnitsService.go(session.id, payload)

        expect(result).to.equal(
          {
            pageTitle: 'Which units were used?',
            activeNavBar: 'search',
            units: null,
            backLink: `/system/return-logs/setup/${session.id}/reported`,
            returnReference: '12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitUnitsService.go(session.id, payload)

          expect(result.error).to.equal({ text: 'Select which units were used' })
        })
      })
    })
  })
})
