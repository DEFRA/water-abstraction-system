'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const MeterDetailsValidator = require('../../../../app/validators/return-logs/setup/meter-details.validator.js')

describe('Return Logs Setup - Meter Details validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        meterDetailsMake: 'WATER',
        meterDetailsSerialNumber: '1234',
        meterDetails10TimesDisplay: 'yes'
      }
    })

    it('confirms the data is valid', () => {
      const result = MeterDetailsValidator.go(payload)

      expect(result.meterDetailsMakeResult.error).not.to.exist()
      expect(result.meterDetailsSerialNumberResult.error).not.to.exist()
      expect(result.meterDetails10TimesDisplayResult.error).not.to.exist()
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because it contains a "make" that is too long', () => {
      beforeEach(() => {
        // Max is 310 characters. This is 311 characters
        payload = {
          meterDetailsMake:
            'kFZIOKxCJeDsSuaRqOjbmAFdtSNqkXVWfUTTPFXSQrftvnfJpUAUiGqXqiMXzKSlxQBFgIxZoBmBHmMECbEMsFHxVbQExkddgDaqXqFh' +
            'XDPStjqHjGdfXLErwoqVoehMemMDcnNwVZpoShasNXmwXwTXaPkSalsZEthlKJbaIynKCrUlWUSKLRlTKluwTFvGUkYeMVSgZIVRRaaX' +
            'dEdZTgcrcxeEzFDsoeuovupUcqbmvmzRQnwyiRFngNwIIELPOXjxDgHOSCzTDXYuJTLuuqjjTgFVXNBogeMowPRFBIdiDzWiHjXFHEH',
          meterDetailsSerialNumber: '1234',
          meterDetails10TimesDisplay: 'yes'
        }
      })

      it('fails validation', () => {
        const result = MeterDetailsValidator.go(payload)

        expect(result.meterDetailsMakeResult.error.details[0].message).to.equal('Make must be 310 characters or less')
        expect(result.meterDetailsSerialNumberResult.error).not.to.exist()
        expect(result.meterDetails10TimesDisplayResult.error).not.to.exist()
      })
    })

    describe('because it contains a "serial number" that is too long', () => {
      beforeEach(() => {
        // Max is 180 characters. This is 181 characters
        payload = {
          meterDetailsMake: 'WATER',
          meterDetailsSerialNumber:
            'MTCbIgRZCXIcRtRGnkuRkqREOjBcKUzaFgwWDSgGPhXkDGxNPWfAqpXmttxCmjBdQEtSfrFOYHIHBgNJrvKQfSMvnQhQKHMMwlDzIYRX' +
            'ZgtrparekHBvIvnxyaYDviUqCOxlJPnSVSvgyUyRlJlpNNrBMatWdYPWQrJNDydjISjjIxYsugOpY',
          meterDetails10TimesDisplay: 'yes'
        }
      })

      it('fails validation', () => {
        const result = MeterDetailsValidator.go(payload)

        expect(result.meterDetailsMakeResult.error).not.to.exist()
        expect(result.meterDetailsSerialNumberResult.error.details[0].message).to.equal(
          'Serial number must be 180 characters or less'
        )
        expect(result.meterDetails10TimesDisplayResult.error).not.to.exist()
      })
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = MeterDetailsValidator.go(payload)

      expect(result.meterDetailsMakeResult.error.details[0].message).to.equal('Enter the make of the meter')
      expect(result.meterDetailsSerialNumberResult.error.details[0].message).to.equal('Enter a serial number')
      expect(result.meterDetails10TimesDisplayResult.error.details[0].message).to.equal(
        'Select if the meter has a ×10 display'
      )
    })
  })

  describe('when only the "make" is provided', () => {
    beforeEach(() => {
      payload = { meterDetailsMake: 'WATER' }
    })

    it('fails validation', () => {
      const result = MeterDetailsValidator.go(payload)

      expect(result.meterDetailsMakeResult.error).to.not.exist()
      expect(result.meterDetailsSerialNumberResult.error.details[0].message).to.equal('Enter a serial number')
      expect(result.meterDetails10TimesDisplayResult.error.details[0].message).to.equal(
        'Select if the meter has a ×10 display'
      )
    })
  })

  describe('when only the "serial number" is provided', () => {
    beforeEach(() => {
      payload = { meterDetailsSerialNumber: '1234' }
    })

    it('fails validation', () => {
      const result = MeterDetailsValidator.go(payload)

      expect(result.meterDetailsMakeResult.error.details[0].message).to.equal('Enter the make of the meter')
      expect(result.meterDetailsSerialNumberResult.error).to.not.exist()
      expect(result.meterDetails10TimesDisplayResult.error.details[0].message).to.equal(
        'Select if the meter has a ×10 display'
      )
    })
  })

  describe('when only the "10 times display" is provided', () => {
    beforeEach(() => {
      payload = { meterDetails10TimesDisplay: 'no' }
    })

    it('fails validation', () => {
      const result = MeterDetailsValidator.go(payload)

      expect(result.meterDetailsMakeResult.error.details[0].message).to.equal('Enter the make of the meter')
      expect(result.meterDetailsSerialNumberResult.error.details[0].message).to.equal('Enter a serial number')
      expect(result.meterDetails10TimesDisplayResult.error).to.not.exist()
    })
  })
})
