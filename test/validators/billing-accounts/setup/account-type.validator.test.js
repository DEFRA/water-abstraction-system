// Thing under test
import AccountTypeValidator from '../../../../app/validators/billing-accounts/setup/account-type.validator.js'

describe('Billing Accounts - Setup - Account Type Validator', () => {
  describe('when called', () => {
    describe('with "accountType" as "company"', () => {
      it('returns with no errors', () => {
        const result = AccountTypeValidator({
          accountType: 'company'
        })

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('with "accountType" as "indiviudual" and a value for "individualName"', () => {
      it('returns with no errors', () => {
        const result = AccountTypeValidator({
          accountType: 'individual',
          individualName: 'John Doe'
        })

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('with "accountType" as "indiviudual" and no value for "individualName"', () => {
      it('returns with errors', () => {
        const result = AccountTypeValidator({
          accountType: 'individual'
        })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter the full name of the individual.')
      })
    })

    describe('with no value for "accountType"', () => {
      it('returns with errors', () => {
        const result = AccountTypeValidator({})

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the account type')
      })
    })

    describe('with an incorrect value for "accountType"', () => {
      it('returns with errors', () => {
        const result = AccountTypeValidator({
          accountType: 'wrong'
        })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the account type')
      })
    })
  })
})
