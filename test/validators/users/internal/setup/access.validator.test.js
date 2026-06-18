'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AccessValidator = require('../../../../../app/validators/users/internal/setup/access.validator.js')

describe('Users - Internal - Setup - Access Validator', () => {
  let payload

  beforeEach(() => {
    payload = { access: 'enabled' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AccessValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the "access" value is missing', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = AccessValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select access for the user')
      })
    })
  })
})
