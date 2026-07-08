'use strict'

// Thing under test
const AccessValidator = require('../../../../../app/validators/users/internal/setup/access.validator.js')

describe('Users - Internal - Setup - Access Validator', () => {
  let payload

  beforeEach(() => {
    payload = { access: 'enabled' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AccessValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the "access" value is missing', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = AccessValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select access for the user')
      })
    })

    describe('because the "access" value is not in the allowed list', () => {
      beforeEach(() => {
        payload.access = 'an-invalid-value'
      })

      it('fails validation', () => {
        const result = AccessValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a valid access option for the user')
      })
    })
  })
})
