'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitMeterProvidedService = require('../../../../app/services/return-logs/setup/submit-meter-provided.service.js')

describe('Return Logs Setup - Submit Meter Provided service', () => {
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
        payload = { meterProvided: 'yes' }
      })

      it('saves the submitted option', async () => {
        await SubmitMeterProvidedService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.meterProvided).to.equal('yes')
      })

      describe('and the user has previously selected "yes" to a meter being provided', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitMeterProvidedService.go(session.id, payload)

          expect(result).to.equal({ meterProvided: 'yes' })
        })
      })

      describe('and the user has previously selected "no" to a meter being provided', () => {
        beforeEach(async () => {
          payload = { meterProvided: 'no' }
        })

        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitMeterProvidedService.go(session.id, payload)

          expect(result).to.equal({ meterProvided: 'no' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMeterProvidedService.go(session.id, payload)

        expect(result).to.equal(
          {
            pageTitle: 'Have meter details been provided?',
            activeNavBar: 'search',
            meterProvided: null,
            backLink: `/system/return-logs/setup/${session.id}/units`,
            returnReference: '12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitMeterProvidedService.go(session.id, payload)

          expect(result.error).to.equal({ text: 'Select if meter details have been provided' })
        })
      })
    })
  })
})
