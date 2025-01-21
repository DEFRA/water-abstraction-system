'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitMeterDetailsService = require('../../../../app/services/return-logs/setup/submit-meter-details.service.js')

describe('Return Logs Setup - Submit Meter Details service', () => {
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
        payload = {
          meterMake: 'WATER',
          meterSerialNumber: '123',
          meter10TimesDisplay: 'yes'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitMeterDetailsService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.meterMake).to.equal('WATER')
        expect(refreshedSession.meterSerialNumber).to.equal('123')
        expect(refreshedSession.meter10TimesDisplay).to.equal('yes')
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMeterDetailsService.go(session.id, payload)

        expect(result).to.equal(
          {
            pageTitle: 'Meter details',
            activeNavBar: 'search',
            meterMake: null,
            meterSerialNumber: null,
            meter10TimesDisplay: null,
            backLink: `/system/return-logs/setup/${session.id}/meter-provided`,
            returnReference: '12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not entered or selected anything', () => {
        it('includes an error for both input elements and radio elements', async () => {
          const result = await SubmitMeterDetailsService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              meterMakeResult: 'Enter the make of the meter',
              meterSerialNumberResult: 'Enter a serial number',
              meter10TimesDisplayResult: 'Select if the meter has a ×10 display'
            }
          })
        })
      })

      describe('because the user has not entered the "make"', () => {
        beforeEach(async () => {
          payload = {
            meterSerialNumber: '123',
            meter10TimesDisplay: 'yes'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              meterMakeResult: 'Enter the make of the meter',
              meterSerialNumberResult: null,
              meter10TimesDisplayResult: null
            }
          })
        })
      })

      describe('because the user has not entered the "serial number"', () => {
        beforeEach(async () => {
          payload = {
            meterMake: 'WATER',
            meter10TimesDisplay: 'yes'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              meterMakeResult: null,
              meterSerialNumberResult: 'Enter a serial number',
              meter10TimesDisplayResult: null
            }
          })
        })
      })

      describe('because the user has not selected the "times 10 display"', () => {
        beforeEach(async () => {
          payload = {
            meterMake: 'WATER',
            meterSerialNumber: '123'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              meterMakeResult: null,
              meterSerialNumberResult: null,
              meter10TimesDisplayResult: 'Select if the meter has a ×10 display'
            }
          })
        })
      })
    })
  })
})
