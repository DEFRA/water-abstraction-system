'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const LicencesValidator = require('../../../../app/validators/company-contacts/setup/licences.validator.js')

describe('Company Contacts - Setup - Licences Validator', () => {
  let payload

  beforeEach(() => {
    payload = { licences: [generateUUID()] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = LicencesValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('when no licences are selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = LicencesValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Select the licences they should get water abstraction alerts emails for'
        )
      })
    })

    describe('when "licences" is an empty array', () => {
      beforeEach(() => {
        payload = { licences: [] }
      })

      it('returns with errors', () => {
        const result = LicencesValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Select the licences they should get water abstraction alerts emails for'
        )
      })
    })

    describe('when "licences" is not an array', () => {
      beforeEach(() => {
        payload = { licences: 'licence' }
      })

      it('returns with errors', () => {
        const result = LicencesValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Select the licences they should get water abstraction alerts emails for'
        )
      })
    })
  })
})
