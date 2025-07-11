'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReturnFormsValidator = require('../../../../app/validators/notices/setup/return-forms.validator.js')

describe('Returns For Paper Forms Validator', () => {
  let payload

  beforeEach(() => {
    payload = { returns: [] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = ReturnFormsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = ReturnFormsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select the returns for the paper forms')
    })
  })
})
