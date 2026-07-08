'use strict'

// Thing under test
const ContactNameValidator = require('../../../../app/validators/billing-accounts/setup/contact-name.validator.js')

describe('Billing Accounts - Setup - Contact Name Validator', () => {
  let payload

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = { contactName: 'Contact Name' }
    })

    it('returns with no errors', () => {
      const result = ContactNameValidator(payload)

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
        const result = ContactNameValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a name for the contact')
      })
    })

    describe('with a "name" longer than 100 characters', () => {
      beforeEach(() => {
        payload = { contactName: 'a'.repeat(101) }
      })

      it('returns with errors', () => {
        const result = ContactNameValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Name must be 100 characters or less')
      })
    })
  })
})
