'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AlertThresholdsValidator = require('../../../../../app/validators/notices/setup/abstraction-alerts/alert-thresholds.validator.js')

describe('Notices Setup - Abstraction Alerts - Alert Thresholds Validator', () => {
  let payload

  beforeEach(() => {
    payload = { 'alert-thresholds': ['0'] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertThresholdsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })

    describe('and the "alert-thresholds"', () => {
      describe('is a string', () => {
        beforeEach(() => {
          payload = { 'alert-thresholds': '0' }
        })

        it('returns with errors', () => {
          const result = AlertThresholdsValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).not.to.exist()
        })
      })

      describe('is an array', () => {
        beforeEach(() => {
          payload = { 'alert-thresholds': ['0'] }
        })

        it('returns with errors', () => {
          const result = AlertThresholdsValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).not.to.exist()
        })
      })
    })
  })

  describe('when called with invalid data', () => {
    describe('and the "alert-thresholds"', () => {
      describe('is not present', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns with errors', () => {
          const result = AlertThresholdsValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Select applicable threshold(s)')
        })
      })

      describe('is not an array or a string', () => {
        beforeEach(() => {
          payload = { 'alert-thresholds': 42 }
        })

        it('returns with errors', () => {
          const result = AlertThresholdsValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Select applicable threshold(s)')
        })
      })
    })
  })
})
