'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const MeterDetailsPresenter = require('../../../../app/presenters/return-logs/setup/meter-details.presenter.js')

describe('Return Logs Setup - Meter Details presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = MeterDetailsPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/meter-provided',
        meterMake: null,
        meterSerialNumber: null,
        meter10TimesDisplay: null,
        pageTitle: 'Meter details',
        returnReference: '012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "Meter provided" page on', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.backLink).to.equal(
          '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/meter-provided'
        )
      })
    })
  })

  describe('the "meterMake" property', () => {
    describe('when the user has previously entered the make of the meter', () => {
      beforeEach(() => {
        session.meterMake = 'WATER'
      })

      it('returns the "meterMake" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.meterMake).to.equal('WATER')
      })
    })
  })

  describe('the "meterSerialNumber" property', () => {
    describe('when the user has previously entered the serial number of the meter', () => {
      beforeEach(() => {
        session.meterSerialNumber = '1234'
      })

      it('returns the "meterSerialNumber" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.meterSerialNumber).to.equal('1234')
      })
    })
  })

  describe('the "meter10TimesDisplay" property', () => {
    describe('when the user has previously selected "yes" to the meter having a times 10 display', () => {
      beforeEach(() => {
        session.meter10TimesDisplay = 'yes'
      })

      it('returns the "meter10TimesDisplay" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.meter10TimesDisplay).to.equal('yes')
      })
    })

    describe('when the user has previously selected "no" to the meter having a times 10 display', () => {
      beforeEach(() => {
        session.meter10TimesDisplay = 'no'
      })

      it('returns the "meter10TimesDisplay" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.meter10TimesDisplay).to.equal('no')
      })
    })
  })
})
