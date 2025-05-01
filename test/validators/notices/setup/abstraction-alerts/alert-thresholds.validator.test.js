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
    payload = { 'alert-thresholds': [] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertThresholdsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
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
})
