// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from '../../../support/generators.js'

// Thing under test
import ExistingAddressValidator from '../../../../app/validators/billing-accounts/setup/existing-address.validator.js'

describe('Billing Accounts - Setup - Existing Address Validator', () => {
  let payload

  describe('when called with valid data', () => {
    describe('and the option is "new"', () => {
      beforeEach(() => {
        payload = { addressSelected: 'new' }
      })

      it('returns with no errors', () => {
        const result = ExistingAddressValidator(payload, 'Customer Name')

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('and the option is a UUID', () => {
      beforeEach(() => {
        payload = { addressSelected: generateUUID() }
      })

      it('returns with no errors', () => {
        const result = ExistingAddressValidator(payload, 'Customer Name')

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
      const result = ExistingAddressValidator(payload, 'Customer Name')

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select an existing address for Customer Name')
    })
  })
})
