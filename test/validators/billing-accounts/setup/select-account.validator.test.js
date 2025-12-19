'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SelectAccountValidator = require('../../../../app/validators/billing-accounts/setup/select-account.validator.js')

describe('Billing Accounts - Setup - Select Account Validator', () => {
  let payload

  describe('when called with a valid option', () => {
    describe('and that option is "customer"', () => {
      beforeEach(() => {
        payload = { accountSelected: 'customer' }
      })

      it('returns with no errors', () => {
        const result = SelectAccountValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('and that option is "another"', () => {
      describe('and the user entered a valid input', () => {
        beforeEach(() => {
          payload = { accountSelected: 'another', searchInput: 'test' }
        })

        it('returns with no errors', () => {
          const result = SelectAccountValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).not.to.exist()
        })
      })

      describe('and the user did not enter a value', () => {
        beforeEach(() => {
          payload = { accountSelected: 'another' }
        })

        it('returns with errors', () => {
          const result = SelectAccountValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter the name of an organisation or individual.')
        })
      })

      describe('and the user enters a value that is too long', () => {
        beforeEach(() => {
          payload = { accountSelected: 'another', searchInput: 'a'.repeat(101) }
        })

        it('returns with errors', () => {
          const result = SelectAccountValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Search query must be 100 characters or less')
        })
      })
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = { accountSelected: 'wrong' }
    })

    it('returns with errors', () => {
      const result = SelectAccountValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select who should the bills go to')
    })
  })
})
