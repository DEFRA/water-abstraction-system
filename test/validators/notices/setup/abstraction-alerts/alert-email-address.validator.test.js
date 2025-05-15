'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AlertEmailAddressValidator = require('../../../../../app/validators/notices/setup/abstraction-alerts/alert-email-address.validator.js')

describe('Alert Email Address Validator', () => {
  let payload

  beforeEach(() => {
    payload = { alertEmailAddress: 'saved-email-address' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertEmailAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = AlertEmailAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Email address for the alert is required')
    })
  })
})
