'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

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

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('such as the UUID of a contact', () => {
      it('returns with no errors', () => {
        const result = ContactValidator.go({
          contactSelected: generateUUID()
        })

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when called with invalid data', () => {
    describe('such as an empty object', () => {
      it('returns with errors', () => {
        const result = ContactValidator.go({})

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select a contact')
      })
    })
  })
})
