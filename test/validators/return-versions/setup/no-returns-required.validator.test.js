'use strict'

// Test framework dependencies
const { describe, it } = require('node:test')
const { expect } = require('@hapi/code')

// Thing under test
const NoReturnsRequiredValidator = require('../../../../app/validators/return-versions/setup/no-returns-required.validator.js')

describe('Return Versions Setup - No Returns Required validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = NoReturnsRequiredValidator.go({ reason: 'licence-conditions-do-not-require-returns' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when valid data is provided', () => {
    describe('because no "reason" is given', () => {
      it('fails validation', () => {
        const result = NoReturnsRequiredValidator.go({ reason: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the reason for no returns required')
      })
    })

    describe('because an unknown "reason" is given', () => {
      it('fails validation', () => {
        const result = NoReturnsRequiredValidator.go({ reason: 'no-water' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the reason for no returns required')
      })
    })
  })
})
