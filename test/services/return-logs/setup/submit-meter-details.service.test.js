'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitMeterDetailsService = require('../../../../app/services/return-logs/setup/submit-meter-details.service.js')

describe('Return Logs Setup - Submit Meter Details service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
      returnReference: '12345',
      reported: 'meterReadings'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub().returns([]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          meterMake: 'WATER',
          meterSerialNumber: '123',
          meter10TimesDisplay: 'yes'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitMeterDetailsService.go(session.id, payload, yarStub)

        expect(session.meterMake).to.equal('WATER')
        expect(session.meterSerialNumber).to.equal('123')
        expect(session.meter10TimesDisplay).to.equal('yes')

        expect(session.$update.called).to.be.true()
      })
    })

    describe('and the page has been not been visited', () => {
      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitMeterDetailsService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          checkPageVisited: undefined,
          reported: 'meterReadings'
        })
      })
    })

    describe('and the page has been visited', () => {
      beforeEach(() => {
        session = SessionModelStub.build(Sinon, {
          ...sessionData,
          checkPageVisited: true
        })

        fetchSessionStub.resolves(session)
      })

      it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
        const result = await SubmitMeterDetailsService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          checkPageVisited: true,
          reported: 'meterReadings'
        })
      })

      it('sets the notification message title to "Updated" and the text to "Reporting details changed" ', async () => {
        await SubmitMeterDetailsService.go(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(notification).to.equal({ titleText: 'Updated', text: 'Reporting details changed' })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMeterDetailsService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            backLink: { href: `/system/return-logs/setup/${session.id}/meter-provided`, text: 'Back' },
            meterMake: null,
            meterSerialNumber: null,
            meter10TimesDisplay: null,
            pageTitle: 'Meter details',
            pageTitleCaption: 'Return reference 12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not entered or selected anything', () => {
        it('includes an error for both input elements and radio elements', async () => {
          const result = await SubmitMeterDetailsService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            errorList: [
              { href: '#meterMake', text: 'Enter the make of the meter' },
              { href: '#meterSerialNumber', text: 'Enter a serial number' },
              {
                href: '#meter10TimesDisplay',
                text: 'Select if the meter has a ×10 display'
              }
            ],
            meterMake: { text: 'Enter the make of the meter' },
            meterSerialNumber: { text: 'Enter a serial number' },
            meter10TimesDisplay: { text: 'Select if the meter has a ×10 display' }
          })
        })
      })

      describe('because the user has not entered the "make"', () => {
        beforeEach(() => {
          payload = {
            meterSerialNumber: '123',
            meter10TimesDisplay: 'yes'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            errorList: [{ href: '#meterMake', text: 'Enter the make of the meter' }],
            meterMake: { text: 'Enter the make of the meter' }
          })
        })
      })

      describe('because the user has not entered the "serial number"', () => {
        beforeEach(() => {
          payload = {
            meterMake: 'WATER',
            meter10TimesDisplay: 'yes'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            errorList: [{ href: '#meterSerialNumber', text: 'Enter a serial number' }],
            meterSerialNumber: { text: 'Enter a serial number' }
          })
        })
      })

      describe('because the user has not selected the "times 10 display"', () => {
        beforeEach(() => {
          payload = {
            meterMake: 'WATER',
            meterSerialNumber: '123'
          }
        })

        it('includes an error for the make input elements', async () => {
          const result = await SubmitMeterDetailsService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            errorList: [{ href: '#meter10TimesDisplay', text: 'Select if the meter has a ×10 display' }],
            meter10TimesDisplay: { text: 'Select if the meter has a ×10 display' }
          })
        })
      })
    })
  })
})
