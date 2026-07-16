// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import ContactEmailValidator from '../../../../app/validators/company-contacts/setup/contact-email.validator.js'

describe('Company Contacts - Setup - Contact Email Validator', () => {
  let payload

  beforeEach(() => {
    payload = { email: 'test@test.com' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = ContactEmailValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = ContactEmailValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter an email address for the contact')
      })
    })

    describe('with an invalid "email"', () => {
      beforeEach(() => {
        payload = { email: 'bad-mail' }
      })

      it('returns with errors', () => {
        const result = ContactEmailValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'Enter an email address in the correct format, like name@example.co.uk '
        )
      })
    })

    describe('with a "email" longer than 100 characters', () => {
      beforeEach(() => {
        payload = { email: `${'a'.repeat(101)}@test.com` }
      })

      it('returns with errors', () => {
        const result = ContactEmailValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Email must be 100 characters or less')
      })
    })
  })
})
