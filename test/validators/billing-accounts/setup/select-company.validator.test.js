'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SelectCompanyValidator = require('../../../../app/validators/billing-accounts/setup/select-company.validator.js')

describe('Billing Accounts - Setup - Select Company Validator', () => {
  let payload

  beforeEach(() => {
    payload = { companiesHouseId: '12345678' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = SelectCompanyValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = SelectCompanyValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select a company from the list')
    })
  })
})
