// Test framework
import { describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from '../../../support/generators.js'

// Thing under test
import ContactValidator from '../../../../app/validators/billing-accounts/setup/contact.validator.js'

describe('Billing Accounts - Setup - Contact Validator', () => {
  describe('when called with valid data', () => {
    describe('such as "new"', () => {
      it('returns with no errors', () => {
        const result = ContactValidator({
          contactSelected: 'new'
        })

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('such as the UUID of a contact', () => {
      it('returns with no errors', () => {
        const result = ContactValidator({
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
        const result = ContactValidator({})

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a contact')
      })
    })
  })
})
