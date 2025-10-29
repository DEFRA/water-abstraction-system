'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PaperReturnValidator = require('../../../../app/validators/notices/setup/paper-return.validator.js')

describe('Paper Return Validator', () => {
  let payload

  beforeEach(() => {
    payload = { returns: [] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = PaperReturnValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = PaperReturnValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select the returns for the paper return')
    })
  })
})
