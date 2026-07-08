// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import AccountValidator from '../../../../app/validators/billing-accounts/setup/account.validator.js'

describe('Billing Accounts - Setup - Account Validator', () => {
  let payload

  describe('when called with a valid option', () => {
    describe('and that option is a customer id', () => {
      beforeEach(() => {
        payload = { accountSelected: generateUUID() }
      })

      it('returns with no errors', () => {
        const result = AccountValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('and that option is "another"', () => {
      describe('and the user entered a valid input', () => {
        beforeEach(() => {
          payload = { accountSelected: 'another', searchInput: 'test' }
        })

        it('returns with no errors', () => {
          const result = AccountValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeUndefined()
        })
      })

      describe('and the user did not enter a search input value', () => {
        beforeEach(() => {
          payload = { accountSelected: 'another' }
        })

        it('returns with errors', () => {
          const result = AccountValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Enter the name of an organisation or individual.')
        })
      })

      describe('and the user enters a value that is too long', () => {
        beforeEach(() => {
          payload = { accountSelected: 'another', searchInput: 'a'.repeat(101) }
        })

        it('returns with errors', () => {
          const result = AccountValidator(payload)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Search query must be 100 characters or less')
        })
      })
    })
  })

  describe('when called with no data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = AccountValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select who should the bills go to')
    })
  })
})
