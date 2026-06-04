'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicencesValidator = require('../../../../../app/validators/users/external/setup/licences.validator.js')

describe('Users - External - Setup - Licences Validator', () => {
  let payload

  beforeEach(() => {
    payload = { licences: ['all'] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = LicencesValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the "licences" value is missing', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = LicencesValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select licences to unregister')
      })
    })
  })
})
