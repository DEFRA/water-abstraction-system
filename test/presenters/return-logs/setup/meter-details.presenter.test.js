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
        meterDetailsMake: null,
        meterDetailsSerialNumber: null,
        meterDetails10TimesDisplay: null,
        pageTitle: 'Meter details',
        returnReference: '012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "meterDetailsMake" property', () => {
    describe('when the user has previously entered the make of the meter', () => {
      beforeEach(() => {
        session.meterDetailsMake = 'WATER'
      })

      it('returns the "meterDetailsMake" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.meterDetailsMake).to.equal('WATER')
      })
    })
  })

  describe('the "meterDetailsSerialNumber" property', () => {
    describe('when the user has previously entered the serial number of the meter', () => {
      beforeEach(() => {
        session.meterDetailsSerialNumber = '1234'
      })

      it('returns the "meterDetailsSerialNumber" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.meterDetailsSerialNumber).to.equal('1234')
      })
    })
  })

  describe('the "meterDetails10TimesDisplay" property', () => {
    describe('when the user has previously selected "yes" to the meter having a times 10 display', () => {
      beforeEach(() => {
        session.meterDetails10TimesDisplay = 'yes'
      })

      it('returns the "meterDetails10TimesDisplay" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.meterDetails10TimesDisplay).to.equal('yes')
      })
    })

    describe('when the user has previously selected "no" to the meter having a times 10 display', () => {
      beforeEach(() => {
        session.meterDetails10TimesDisplay = 'no'
      })

      it('returns the "meterDetails10TimesDisplay" property populated to re-select the option', () => {
        const result = MeterDetailsPresenter.go(session)

        expect(result.meterDetails10TimesDisplay).to.equal('no')
      })
    })
  })
})
