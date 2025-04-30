'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AlertTypeValidator = require('../../../../../app/validators/notices/setup/abstraction-alerts/alert-type.validator.js')

describe('Notices - Setup - Abstraction Alerts - Alert Type Validator', () => {
  let payload

  beforeEach(() => {
    payload = {
      'alert-type': 'stop'
    }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = AlertTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select the type of alert you need to send')
    })
  })
})
