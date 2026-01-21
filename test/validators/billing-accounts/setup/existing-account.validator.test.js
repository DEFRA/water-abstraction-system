'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ExistingAccountValidator = require('../../../../app/validators/billing-accounts/setup/existing-account.validator.js')

describe('Billing Accounts - Setup - Select Existing Account Validator', () => {
  let payload

  beforeEach(() => {
    payload = { placeholder: '' }
  })

  describe('when called with valid data', () => {
    describe('and the option is "new"', () => {
      beforeEach(() => {
        payload = { existingAccount: 'new' }
      })

      it('returns with no errors', () => {
        const result = ExistingAccountValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('and the option is a UUID', () => {
      beforeEach(() => {
        payload = { existingAccount: generateUUID() }
      })

      it('returns with no errors', () => {
        const result = ExistingAccountValidator.go(payload)

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
      const result = ExistingAccountValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select does this account already exist?')
    })
  })
})
