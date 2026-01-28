'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ContactEmailValidator = require('../../../../app/validators/company-contacts/setup/contact-email.validator.js')

describe('Company Contacts - Setup - Contact Email Validator', () => {
  let payload

  beforeEach(() => {
    payload = { email: 'test@test.com' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = ContactEmailValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = ContactEmailValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('"email" is required')
    })
  })
})
