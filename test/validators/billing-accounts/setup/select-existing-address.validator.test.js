'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const SelectExistingAddressValidator = require('../../../../app/validators/billing-accounts/setup/select-existing-address.validator.js')

describe('Billing Accounts - Setup - Select Existing Address Validator', () => {
  let payload

  describe('when called with valid data', () => {
    describe('and the option is "new"', () => {
      beforeEach(() => {
        payload = { addressSelected: 'new' }
      })

      it('returns with no errors', () => {
        const result = SelectExistingAddressValidator.go(payload, 'Customer Name')

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('and the option is a UUID', () => {
      beforeEach(() => {
        payload = { addressSelected: generateUUID() }
      })

      it('returns with no errors', () => {
        const result = SelectExistingAddressValidator.go(payload, 'Customer Name')

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = SelectExistingAddressValidator.go(payload, 'Customer Name')

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select an existing address for Customer Name')
    })
  })
})
