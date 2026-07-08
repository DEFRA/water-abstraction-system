'use strict'

// Thing under test
const MeterDetailsValidator = require('../../../../app/validators/return-logs/setup/meter-details.validator.js')

describe('Return Logs Setup - Meter Details validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        meterMake: 'WATER',
        meterSerialNumber: '1234',
        meter10TimesDisplay: 'yes'
      }
    })

    it('confirms the data is valid', () => {
      const result = MeterDetailsValidator(payload)

      expect(result.error).toBeUndefined()
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because it contains a "make" that is too long', () => {
      beforeEach(() => {
        // Max is 310 characters. This is 311 characters
        payload = {
          meterMake:
            'kFZIOKxCJeDsSuaRqOjbmAFdtSNqkXVWfUTTPFXSQrftvnfJpUAUiGqXqiMXzKSlxQBFgIxZoBmBHmMECbEMsFHxVbQExkddgDaqXqFh' +
            'XDPStjqHjGdfXLErwoqVoehMemMDcnNwVZpoShasNXmwXwTXaPkSalsZEthlKJbaIynKCrUlWUSKLRlTKluwTFvGUkYeMVSgZIVRRaaX' +
            'dEdZTgcrcxeEzFDsoeuovupUcqbmvmzRQnwyiRFngNwIIELPOXjxDgHOSCzTDXYuJTLuuqjjTgFVXNBogeMowPRFBIdiDzWiHjXFHEH',
          meterSerialNumber: '1234',
          meter10TimesDisplay: 'yes'
        }
      })

      it('fails validation', () => {
        const result = MeterDetailsValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Make must be 310 characters or less')
      })
    })

    describe('because it contains a "serial number" that is too long', () => {
      beforeEach(() => {
        // Max is 180 characters. This is 181 characters
        payload = {
          meterMake: 'WATER',
          meterSerialNumber:
            'MTCbIgRZCXIcRtRGnkuRkqREOjBcKUzaFgwWDSgGPhXkDGxNPWfAqpXmttxCmjBdQEtSfrFOYHIHBgNJrvKQfSMvnQhQKHMMwlDzIYRX' +
            'ZgtrparekHBvIvnxyaYDviUqCOxlJPnSVSvgyUyRlJlpNNrBMatWdYPWQrJNDydjISjjIxYsugOpY',
          meter10TimesDisplay: 'yes'
        }
      })

      it('fails validation', () => {
        const result = MeterDetailsValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Serial number must be 180 characters or less')
      })
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = MeterDetailsValidator(payload)

      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter the make of the meter')
      expect(result.error.details[1].message).toEqual('Enter a serial number')
      expect(result.error.details[2].message).toEqual('Select if the meter has a ×10 display')
    })
  })

  describe('when only the "make" is provided', () => {
    beforeEach(() => {
      payload = { meterMake: 'WATER' }
    })

    it('fails validation', () => {
      const result = MeterDetailsValidator(payload)

      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter a serial number')
      expect(result.error.details[1].message).toEqual('Select if the meter has a ×10 display')
    })
  })

  describe('when only the "serial number" is provided', () => {
    beforeEach(() => {
      payload = { meterSerialNumber: '1234' }
    })

    it('fails validation', () => {
      const result = MeterDetailsValidator(payload)

      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter the make of the meter')
      expect(result.error.details[1].message).toEqual('Select if the meter has a ×10 display')
    })
  })

  describe('when only the "10 times display" is provided', () => {
    beforeEach(() => {
      payload = { meter10TimesDisplay: 'no' }
    })

    it('fails validation', () => {
      const result = MeterDetailsValidator(payload)

      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter the make of the meter')
      expect(result.error.details[1].message).toEqual('Enter a serial number')
    })
  })
})
