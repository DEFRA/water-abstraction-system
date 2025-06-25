'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PostcodeValidator = require('../../../app/validators/address/postcode.validator.js')

describe('Postcode Validator', () => {
  let payload

  beforeEach(() => {
    payload = { postcode: 'SW1A 1AA' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = PostcodeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = PostcodeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Enter a UK postcode')
    })
  })
})
