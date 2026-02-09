'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CompanyNameValidator = require('../../../../app/validators/billing-accounts/setup/company-search.validator.js')

describe('Billing Accounts - Setup - Company Name Validator', () => {
  let payload

  beforeEach(() => {
    payload = { companySearch: 'Company Name' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = CompanyNameValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = CompanyNameValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter the Companies House number or company name')
      })
    })

    describe('with a "company name" longer than 100 characters', () => {
      beforeEach(() => {
        payload = { companySearch: 'a'.repeat(101) }
      })

      it('returns with errors', () => {
        const result = CompanyNameValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Companies House number or company name must be 100 characters or less'
        )
      })
    })
  })
})
