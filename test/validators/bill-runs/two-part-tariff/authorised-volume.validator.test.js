'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AuthorisedVolumeValidator = require('../../../../app/validators/bill-runs/two-part-tariff/authorised-volume.validator.js')

describe('Authorised Volume validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user entered an authorised volume', () => {
      beforeEach(() => {
        payload = {
          authorisedVolume: '10',
          totalBillableReturns: '5',
          minVolume: '5',
          maxVolume: '20'
        }
      })

      it('confirms the payload is valid', () => {
        const result = AuthorisedVolumeValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not enter an authorised volume', () => {
      beforeEach(() => {
        payload = {
          totalBillableReturns: '5',
          minVolume: '5',
          maxVolume: '20'
        }
      })

      it("fails the validation with the message 'Enter an authorised volume'", () => {
        const result = AuthorisedVolumeValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter an authorised volume')
      })
    })

    describe('because the user entered text', () => {
      beforeEach(() => {
        payload = {
          authorisedVolume: 'Hello World',
          totalBillableReturns: '5',
          minVolume: '5',
          maxVolume: '20'
        }
      })

      it("fails the validation with the message 'The authorised volume must be a number'", () => {
        const result = AuthorisedVolumeValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The authorised volume must be a number')
      })
    })

    describe('because the user entered a number less than the totalBillableReturns', () => {
      beforeEach(() => {
        payload = {
          authorisedVolume: '5',
          totalBillableReturns: '6',
          minVolume: '5',
          maxVolume: '20'
        }
      })

      it("fails the validation with the message 'The authorised volume must be greater than 6'", () => {
        const result = AuthorisedVolumeValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The authorised volume must be greater than 6')
      })
    })

    describe('because the user entered a number less than the minVolume', () => {
      beforeEach(() => {
        payload = {
          authorisedVolume: '5',
          totalBillableReturns: '5',
          minVolume: '6',
          maxVolume: '20'
        }
      })

      it("fails the validation with the message 'The authorised volume must be greater than 6'", () => {
        const result = AuthorisedVolumeValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The authorised volume must be greater than 6')
      })
    })

    describe('because the user entered a number greater than the max volume', () => {
      beforeEach(() => {
        payload = {
          authorisedVolume: '25',
          totalBillableReturns: '5',
          minVolume: '6',
          maxVolume: '20'
        }
      })

      it("fails the validation with the message ''The authorised volume must be equal to or less than 20'", () => {
        const result = AuthorisedVolumeValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The authorised volume must be equal to or less than 20')
      })
    })

    describe('because the user entered too many decimal places', () => {
      beforeEach(() => {
        payload = {
          authorisedVolume: '15.1234567',
          totalBillableReturns: '5',
          minVolume: '6',
          maxVolume: '20'
        }
      })

      it("fails the validation with the message 'The authorised volume must not have more than 6 decimal places'", () => {
        const result = AuthorisedVolumeValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The authorised volume must not have more than 6 decimal places')
      })
    })
  })
})
