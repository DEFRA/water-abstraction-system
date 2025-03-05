'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StartReadingValidator = require('../../../../app/validators/return-logs/setup/start-reading.validator.js')

describe('Return Logs Setup - Start Reading validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user entered a value', () => {
      beforeEach(() => {
        payload = { startReading: '156000' }
      })

      it('confirms the payload is valid', () => {
        const result = StartReadingValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not enter anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Enter a start meter reading"', () => {
        const result = StartReadingValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a start meter reading')
      })
    })

    describe('but entered text', () => {
      beforeEach(() => {
        payload.startReading = 'Test'
      })

      it('fails validation with the message "Start meter reading must be a positive number"', () => {
        const result = StartReadingValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Start meter reading must be a positive number')
      })
    })

    describe('but entered a negative start reading', () => {
      beforeEach(() => {
        payload.startReading = '-0.1'
      })

      it('fails validation with the message "Start meter reading must be a positive number"', () => {
        const result = StartReadingValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Start meter reading must be a positive number')
      })
    })

    describe('but entered a decimal number', () => {
      beforeEach(() => {
        payload.startReading = '1.1'
      })

      it('fails validation with the message "Enter a whole number"', () => {
        const result = StartReadingValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a whole number')
      })
    })
  })
})
