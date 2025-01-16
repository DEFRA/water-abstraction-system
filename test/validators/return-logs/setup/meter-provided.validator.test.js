'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const MeterProvidedValidator = require('../../../../app/validators/return-logs/setup/meter-provided.validator.js')

describe('Return Logs Setup - Meter Provided validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the "yes" option', () => {
      beforeEach(() => {
        payload = { meterProvided: 'yes' }
      })

      it('confirms the payload is valid', () => {
        const result = MeterProvidedValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the "no" option', () => {
      beforeEach(() => {
        payload = { meterProvided: 'no' }
      })

      it('confirms the payload is valid', () => {
        const result = MeterProvidedValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select if meter details have been provided"', () => {
        const result = MeterProvidedValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select if meter details have been provided')
      })
    })
  })
})
