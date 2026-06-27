'use strict'

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ContactValidator = require('../../../../app/validators/billing-accounts/setup/contact.validator.js')

describe('Billing Accounts - Setup - Contact Validator', () => {
  describe('when called with valid data', () => {
    describe('such as "new"', () => {
      it('returns with no errors', () => {
        const result = ContactValidator.go({
          contactSelected: 'new'
        })

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('such as the UUID of a contact', () => {
      it('returns with no errors', () => {
        const result = ContactValidator.go({
          contactSelected: generateUUID()
        })

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when called with invalid data', () => {
    describe('such as an empty object', () => {
      it('returns with errors', () => {
        const result = ContactValidator.go({})

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a contact')
      })
    })
  })
})
