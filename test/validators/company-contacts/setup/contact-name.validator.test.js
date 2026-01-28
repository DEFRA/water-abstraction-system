'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ContactNameValidator = require('../../../../app/validators/company-contacts/setup/contact-name.validator.js')

describe('Company Contacts - Setup - Contact Name Validator', () => {
  let payload

  beforeEach(() => {
    payload = { name: 'Eric' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = ContactNameValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = ContactNameValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a name for the contact')
      })
    })

    describe('with a "name" longer than 100 characters', () => {
      beforeEach(() => {
        payload = { name: 'a'.repeat(101) }
      })

      it('returns with errors', () => {
        const result = ContactNameValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Name must be 100 characters or less')
      })
    })
  })
})
