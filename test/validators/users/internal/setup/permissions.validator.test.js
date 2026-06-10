'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PermissionsValidator = require('../../../../../app/validators/users/internal/setup/permissions.validator.js')

describe('Users - Internal - Setup - Permissions Validator', () => {
  let payload

  beforeEach(() => {
    payload = { permission: 'basic' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = PermissionsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the "permission" value is missing', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = PermissionsValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select permissions for the user')
      })
    })

    describe('because the "permission" value is not in the allowed list', () => {
      beforeEach(() => {
        payload.permission = 'an-invalid-value'
      })

      it('fails validation', () => {
        const result = PermissionsValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select valid permissions for the user')
      })
    })
  })
})
