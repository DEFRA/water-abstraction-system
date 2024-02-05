'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const NoReturnsRequiredValidator = require('../../../app/validators/return-requirements/no-returns-required.validator.js')

describe('No Returns Required validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = NoReturnsRequiredValidator.go({ 'no-returns-required': 'transfer_licence' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when valid data is provided', () => {
    describe("because no 'reason' is given", () => {
      it('fails validation', () => {
        const result = NoReturnsRequiredValidator.go({ 'no-returns-required': '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the reason for the return requirement')
      })
    })

    describe("because an unknown 'reason' is given", () => {
      it('fails validation', () => {
        const result = NoReturnsRequiredValidator.go({ 'no-returns-required': 'no-water' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the reason for the return requirement')
      })
    })
  })
})
