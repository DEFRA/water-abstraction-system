'use strict'

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

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
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

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with no data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = ContactTypeValidator.go(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select how to contact the recipient')
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

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter an email address')
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

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual(
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

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter the recipients name')
    })
  })
})
