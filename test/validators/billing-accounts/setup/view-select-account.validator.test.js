'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewSelectAccountValidator = require('../../../../app/validators/billing-accounts/setup/view-select-account.validator.js')

describe('Billing Accounts - Setup - View Select Account Validator', () => {
  let payload

  beforeEach(() => {
    payload = { accountSelected: 'customer' }
  })

  describe('when called with a valid option', () => {
    describe('and that option is "customer', () => {
      it('returns with no errors', () => {
        const result = ViewSelectAccountValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('and that option is "another', () => {
      it('returns with no errors', () => {
        const result = ViewSelectAccountValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = { accountSelected: 'wrong' }
    })

    it('returns with errors', () => {
      const result = ViewSelectAccountValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select who should the bills go to')
    })
  })
})
