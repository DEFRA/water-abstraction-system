'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ContactTypeValidator = require('../../../../app/validators/notices/setup/contact-type.validator.js')

describe('Contact Type Validator', () => {
  let payload

  describe('when called with valid email contact type data', () => {
    beforeEach(() => {
      payload = {
        contactType: 'email',
        contactEmail: 'test@test.gov.uk'
      }
    })

    it('returns with no errors', () => {
      const result = ContactTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with valid post contact type data', () => {
    beforeEach(() => {
      payload = {
        contactType: 'post',
        contactName: 'Fake Name'
      }
    })

    it('returns with no errors', () => {
      const result = ContactTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with no data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = ContactTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select how to contact the recipient')
    })
  })

  describe('when called with an email type but no email field', () => {
    beforeEach(() => {
      payload = {
        contactType: 'email'
      }
    })

    it('returns with errors', () => {
      const result = ContactTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Enter an email address')
    })
  })

  describe('when called with an email type and an invalid email', () => {
    beforeEach(() => {
      payload = {
        contactType: 'email',
        contactEmail: 'test'
      }
    })

    it('returns with errors', () => {
      const result = ContactTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal(
        'Enter an email address in the correct format, like name@example.com'
      )
    })
  })

  describe('when called with a post type but no name field', () => {
    beforeEach(() => {
      payload = {
        contactType: 'post'
      }
    })

    it('returns with errors', () => {
      const result = ContactTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Enter the recipients name')
    })
  })
})
