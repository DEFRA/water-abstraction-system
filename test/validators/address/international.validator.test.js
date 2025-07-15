'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const InternationalValidator = require('../../../app/validators/address/international.validator.js')

describe('Address - International Validator', () => {
  let payload

  beforeEach(() => {
    payload = { addressLine1: '1 Fake street' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = InternationalValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = InternationalValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Enter address line 1')
    })
  })
})
