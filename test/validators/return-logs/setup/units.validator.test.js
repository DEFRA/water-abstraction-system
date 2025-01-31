'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const UnitsValidator = require('../../../../app/validators/return-logs/setup/units.validator.js')

describe('Return Logs Setup - Units validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the "cubic-metres" option', () => {
      beforeEach(() => {
        payload = { units: 'cubic-metres' }
      })

      it('confirms the payload is valid', () => {
        const result = UnitsValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the "litres" option', () => {
      beforeEach(() => {
        payload = { units: 'litres' }
      })

      it('confirms the payload is valid', () => {
        const result = UnitsValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the "megalitres" option', () => {
      beforeEach(() => {
        payload = { units: 'megalitres' }
      })

      it('confirms the payload is valid', () => {
        const result = UnitsValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the "gallons" option', () => {
      beforeEach(() => {
        payload = { units: 'gallons' }
      })

      it('confirms the payload is valid', () => {
        const result = UnitsValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select which units were used"', () => {
        const result = UnitsValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select which units were used')
      })
    })
  })
})
