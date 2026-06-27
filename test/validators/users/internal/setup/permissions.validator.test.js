'use strict'

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

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the "permission" value is missing', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = PermissionsValidator.go(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select permissions for the user')
      })
    })

    describe('because the "permission" value is not in the allowed list', () => {
      beforeEach(() => {
        payload.permission = 'an-invalid-value'
      })

      it('fails validation', () => {
        const result = PermissionsValidator.go(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select valid permissions for the user')
      })
    })
  })
})
