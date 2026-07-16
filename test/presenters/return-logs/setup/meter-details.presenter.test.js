// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import MeterDetailsPresenter from '../../../../app/presenters/return-logs/setup/meter-details.presenter.js'

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
      const result = MeterDetailsPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/meter-provided',
          text: 'Back'
        },
        meterMake: null,
        meterSerialNumber: null,
        meter10TimesDisplay: null,
        pageTitle: 'Meter details',
        pageTitleCaption: 'Return reference 012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "meterMake" property', () => {
    describe('when the user has previously entered the make of the meter', () => {
      beforeEach(() => {
        session.meterMake = 'WATER'
      })

      it('returns the "meterMake" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter(session)

        expect(result.meterMake).toEqual('WATER')
      })
    })
  })

  describe('the "meterSerialNumber" property', () => {
    describe('when the user has previously entered the serial number of the meter', () => {
      beforeEach(() => {
        session.meterSerialNumber = '1234'
      })

      it('returns the "meterSerialNumber" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter(session)

        expect(result.meterSerialNumber).toEqual('1234')
      })
    })
  })

  describe('the "meter10TimesDisplay" property', () => {
    describe('when the user has previously selected "yes" to the meter having a times 10 display', () => {
      beforeEach(() => {
        session.meter10TimesDisplay = 'yes'
      })

      it('returns the "meter10TimesDisplay" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter(session)

        expect(result.meter10TimesDisplay).toEqual('yes')
      })
    })

    describe('when the user has previously selected "no" to the meter having a times 10 display', () => {
      beforeEach(() => {
        session.meter10TimesDisplay = 'no'
      })

      it('returns the "meter10TimesDisplay" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter(session)

        expect(result.meter10TimesDisplay).toEqual('no')
      })
    })
  })
})
