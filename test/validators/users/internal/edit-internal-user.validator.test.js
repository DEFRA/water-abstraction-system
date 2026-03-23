'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const EditUserValidator = require('../../../../app/validators/users/internal/edit-user.validator.js')

describe('Users - Internal - Edit User Validator', () => {
  let payload

  beforeEach(() => {
    payload = { permissions: 'basic' }
  })

  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = EditUserValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because the "permissions" value is missing', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = EditUserValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid permission')
        expect(result.error.details[0].path[0]).to.equal('permissions')
      })
    })

    describe('because the "permissions" value is not in the allowed list', () => {
      beforeEach(() => {
        payload.permissions = 'an-invalid-value'
      })

      it('fails validation', () => {
        const result = EditUserValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid permission')
        expect(result.error.details[0].path[0]).to.equal('permissions')
      })
    })
  })
})
