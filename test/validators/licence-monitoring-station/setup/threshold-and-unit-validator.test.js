'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ThresholdAndUnitValidator = require('../../../../app/validators/licence-monitoring-station/setup/threshold-and-unit.validator.js')

describe('Licence Monitoring Station Setup - Threshold and Unit validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        unit: 'm3/d',
        threshold: '1000'
      }
    })

    it('confirms the data is valid', () => {
      const result = ThresholdAndUnitValidator.go(payload)

      expect(result.error).not.to.exist()
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because it contains a "threshold" that is a negative number', () => {
      beforeEach(() => {
        payload = {
          threshold: '-1000',
          unit: 'm3/d'
        }
      })

      it('fails validation', () => {
        const result = ThresholdAndUnitValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a threshold')
      })
    })

    describe('because it contains a "threshold" that is too large', () => {
      beforeEach(() => {
        payload = {
          threshold: '11000000',
          unit: 'm3/d'
        }
      })

      it('fails validation', () => {
        const result = ThresholdAndUnitValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a threshold less than 10000000')
      })
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {
        unit: 'select'
      }
    })

    it('fails validation', () => {
      const result = ThresholdAndUnitValidator.go(payload)

      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Enter a threshold')
      expect(result.error.details[1].message).to.equal('Select which units to use')
    })
  })

  describe('when only the "threshold" is provided', () => {
    beforeEach(() => {
      // The presenter will always default to the 'Select an option text' if the user hasn't selected a unit, hence why
      // this is always in the payload
      payload = {
        threshold: '1000',
        unit: 'select'
      }
    })

    it('fails validation', () => {
      const result = ThresholdAndUnitValidator.go(payload)

      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select which units to use')
    })
  })

  describe('when only the "unit" is provided', () => {
    beforeEach(() => {
      payload = { unit: 'm3/d' }
    })

    it('fails validation', () => {
      const result = ThresholdAndUnitValidator.go(payload)

      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Enter a threshold')
    })
  })
})
