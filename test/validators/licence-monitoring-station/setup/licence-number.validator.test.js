'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceNumberValidator = require('../../../../app/validators/licence-monitoring-station/setup/licence-number.validator.js')

describe('Licence Monitoring Station Setup - Licence Number Validator', () => {
  let payload

  beforeEach(() => {
    payload = { placeholder: '' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = LicenceNumberValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = LicenceNumberValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('"placeholder" is required')
    })
  })
})
