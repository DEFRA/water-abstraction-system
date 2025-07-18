'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ManualAddressValidator = require('../../../app/validators/address/manual.validator.js')

describe('Address - Manual Validator', () => {
  let payload

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = {
        addressLine1: '1 Fake Farm',
        addressLine2: '1 Fake street',
        addressLine3: 'Fake Village',
        addressLine4: 'Fake City',
        postcode: 'SW1A 1AA'
      }
    })

    it('returns with no errors', () => {
      const result = ManualAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with no data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = ManualAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error.details[0].message).to.equal('Enter address line 1')
      expect(result.error.details[1].message).to.equal('Enter a UK postcode')
    })
  })

  describe('when called with an invalid addressLine1', () => {
    beforeEach(() => {
      payload = { addressLine1: '<', postcode: 'SW1A 1AA' }
    })

    it('returns with errors', () => {
      const result = ManualAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error.details[0].message).to.equal('Address line 1 cannot start with a special character')
    })
  })

  describe('when called with an invalid addressLine2', () => {
    beforeEach(() => {
      payload = { addressLine1: '1 Fake street', addressLine2: '@', postcode: 'SW1A 1AA' }
    })

    it('returns with errors', () => {
      const result = ManualAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error.details[0].message).to.equal('Address line 2 cannot start with a special character')
    })
  })

  describe('when called with an invalid addressLine3', () => {
    beforeEach(() => {
      payload = { addressLine1: '1 Fake street', addressLine3: '(', postcode: 'SW1A 1AA' }
    })

    it('returns with errors', () => {
      const result = ManualAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error.details[0].message).to.equal('Address line 3 cannot start with a special character')
    })
  })

  describe('when called with an invalid addressLine4', () => {
    beforeEach(() => {
      payload = { addressLine1: '1 Fake street', addressLine4: ')', postcode: 'SW1A 1AA' }
    })

    it('returns with errors', () => {
      const result = ManualAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error.details[0].message).to.equal('Address line 4 cannot start with a special character')
    })
  })

  describe('when called with an invalid postcode', () => {
    beforeEach(() => {
      payload = { addressLine1: '1 Fake street', postcode: 'notapostcode' }
    })

    it('returns with errors', () => {
      const result = ManualAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error.details[0].message).to.equal('Enter a valid UK postcode')
    })
  })
})
