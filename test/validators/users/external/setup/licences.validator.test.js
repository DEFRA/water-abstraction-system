'use strict'

// Thing under test
const LicencesValidator = require('../../../../../app/validators/users/external/setup/licences.validator.js')

describe('Users - External - Setup - Licences Validator', () => {
  let payload

  beforeEach(() => {
    payload = { licences: ['all'] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = LicencesValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the "licences" value is missing', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = LicencesValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select licences to unregister')
      })
    })
  })
})
