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
    describe('such as "person"', () => {
      it('returns with no errors', () => {
        const result = ContactValidator.go({
          contactSelected: 'person'
        })

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('such as "department" with a "departmentName"', () => {
      it('returns with no errors', () => {
        const result = ContactValidator.go({
          contactSelected: 'department',
          departmentName: 'Department Name'
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

    describe('such as "accountSelect" as department but no value for "departmentName"', () => {
      it('returns with errors', () => {
        const result = ContactValidator.go({
          contactSelected: 'department'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Department name cannot be blank')
      })
    })

    describe('such as "accountSelect" as department but "departmentName" more than 100 characters', () => {
      it('returns with errors', () => {
        const result = ContactValidator.go({
          contactSelected: 'department',
          departmentName: 'a'.repeat(101)
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Department name must be 100 characters or less')
      })
    })
  })
})
