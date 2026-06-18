'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { licenceEnds } = require('../../../support/fixtures/licence.fixture.js')
const { yesterday } = require('../../../support/general.js')

// Thing under test
const LicenceNumberValidator = require('../../../../app/validators/licence-monitoring-station/setup/licence-number.validator.js')

describe('Licence Monitoring Station Setup - Licence Number Validator', () => {
  let licence
  let payload = {}

  beforeEach(() => {
    licence = licenceEnds()
  })

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = {
        licenceRef: '1234567890'
      }
    })

    it('returns with no errors', () => {
      const result = LicenceNumberValidator.go(payload, licence)

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
        const result = LicenceNumberValidator.go(payload, licence)

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
        const result = LicenceNumberValidator.go(payload, licence)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a licence number')
      })
    })

    describe('because the licence number was not found', () => {
      beforeEach(() => {
        licence = undefined

        payload = {
          licenceRef: generateLicenceRef()
        }
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator.go(payload, licence)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Licence could not be found')
      })
    })

    describe('because the licence has ended', () => {
      beforeEach(() => {
        licence = licenceEnds(yesterday())

        payload = {
          licenceRef: generateLicenceRef()
        }
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator.go(payload, licence)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The licence has ended')
      })
    })
  })
})
