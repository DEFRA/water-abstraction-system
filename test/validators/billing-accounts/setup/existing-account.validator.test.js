// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import ExistingAccountValidator from '../../../../app/validators/billing-accounts/setup/existing-account.validator.js'

describe('Billing Accounts - Setup - Existing Account validator', () => {
  let payload

  describe('when called with valid data', () => {
    describe('and the option is "new"', () => {
      beforeEach(() => {
        payload = { existingAccount: 'new' }
      })

      it('returns with no errors', () => {
        const result = ExistingAccountValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('and the option is a UUID', () => {
      beforeEach(() => {
        payload = { existingAccount: generateUUID() }
      })

      it('returns with no errors', () => {
        const result = ExistingAccountValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = ExistingAccountValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select does this account already exist?')
    })
  })
})
