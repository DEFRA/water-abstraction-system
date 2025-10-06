'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StandardValidator = require('../../../../app/validators/notices/setup/standard.validator.js')

describe('Standard Validator', () => {
  let payload

  beforeEach(() => {
    payload = { noticeType: 'invitations' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = StandardValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = StandardValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select a notice type')
    })
  })
})
