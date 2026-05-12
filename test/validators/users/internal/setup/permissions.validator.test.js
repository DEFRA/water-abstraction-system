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
    payload = { permissions: 'basic' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = PermissionsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the "permissions" value is missing', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = PermissionsValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select a permission')
      })
    })

    describe('because the "permissions" value is not in the allowed list', () => {
      beforeEach(() => {
        payload.permissions = 'an-invalid-value'
      })

      it('fails validation', () => {
        const result = PermissionsValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid permission')
      })
    })
  })
})
