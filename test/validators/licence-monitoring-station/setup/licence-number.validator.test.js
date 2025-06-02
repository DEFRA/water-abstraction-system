'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceNumberValidator = require('../../../../app/validators/licence-monitoring-station/setup/licence-number.validator.js')

describe('Licence Monitoring Station Setup - Licence Number Validator', () => {
  let licenceExists
  let payload = {}

  describe('when called with valid data', () => {
    beforeEach(() => {
      licenceExists = true
      payload = {
        licenceRef: '1234567890'
      }
    })

    it('returns with no errors', () => {
      const result = LicenceNumberValidator.go(payload, licenceExists)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the licence number is not present', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a licence number')
      })
    })

    describe('because the licence number is empty', () => {
      beforeEach(() => {
        payload = {
          licenceRef: ''
        }
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a licence number')
      })
    })

    describe('because the licence number was not found', () => {
      beforeEach(() => {
        licenceExists = false
        payload = {
          licenceRef: '1234567890'
        }
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator.go(payload, licenceExists)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid licence number')
      })
    })
  })
})
