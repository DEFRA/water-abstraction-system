'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AccountTypeValidator = require('../../../../app/validators/billing-accounts/setup/account-type.validator.js')

describe('Billing Accounts - Setup - Account Type Validator', () => {
  describe('when called', () => {
    describe('with "accountType" as "company"', () => {
      it('returns with no errors', () => {
        const result = AccountTypeValidator.go({
          accountType: 'company'
        })

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('with "accountType" as "indiviudual" and a value for "searchIndividualInput"', () => {
      it('returns with no errors', () => {
        const result = AccountTypeValidator.go({
          accountType: 'individual',
          searchIndividualInput: 'John Doe'
        })

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('with "accountType" as "indiviudual" and no value for "searchIndividualInput"', () => {
      it('returns with errors', () => {
        const result = AccountTypeValidator.go({
          accountType: 'individual'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter the full name of the individual.')
      })
    })

    describe('with no value for "accountType"', () => {
      it('returns with errors', () => {
        const result = AccountTypeValidator.go({})

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the account type')
      })
    })

    describe('with an incorrect value for "accountType"', () => {
      it('returns with errors', () => {
        const result = AccountTypeValidator.go({
          accountType: 'wrong'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the account type')
      })
    })
  })
})
