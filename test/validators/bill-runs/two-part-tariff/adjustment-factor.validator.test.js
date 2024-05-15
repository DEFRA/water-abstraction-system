'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AdjustmentFactorValidator = require('../../../../app/validators/bill-runs/two-part-tariff/adjustment-factor.validator.js')

describe('Adjustment Factor validator', () => {
  let payload
  let maxNumberOfDecimals
  let validationType

  describe('when a valid payload is provided', () => {
    describe('because there is a valid aggregate factor', () => {
      beforeEach(() => {
        payload = {
          amendedAggregateFactor: 0.5
        }

        maxNumberOfDecimals = 2
        validationType = 'aggregate'
      })

      it('confirms the payload is valid', () => {
        const result = AdjustmentFactorValidator.go(payload.amendedAggregateFactor, maxNumberOfDecimals, validationType)

        expect(result.error).not.to.exist()
      })
    })

    describe('because there is a valid charge factor', () => {
      beforeEach(() => {
        payload = {
          amendedChargeAdjustment: 0.5
        }

        maxNumberOfDecimals = 15
        validationType = 'charge'
      })

      it('confirms the payload is valid', () => {
        const result = AdjustmentFactorValidator.go(payload.amendedChargeAdjustment, maxNumberOfDecimals, validationType)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided for the aggregate factor', () => {
    describe('because nothing was entered', () => {
      beforeEach(() => {
        payload = undefined

        maxNumberOfDecimals = 2
        validationType = 'aggregate'
      })

      it("fails the validation with the message 'Enter a aggregate factor'", () => {
        const result = AdjustmentFactorValidator.go(payload, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a aggregate factor')
      })
    })

    describe('because the user entered text', () => {
      beforeEach(() => {
        payload = {
          amendedAggregateFactor: 'Hello World'
        }

        maxNumberOfDecimals = 2
        validationType = 'aggregate'
      })

      it("fails the validation with the message 'The aggregate factor must be a number'", () => {
        const result = AdjustmentFactorValidator.go(payload.amendedAggregateFactor, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The aggregate factor must be a number')
      })
    })

    describe('because the user entered too many decimal places', () => {
      beforeEach(() => {
        payload = {
          amendedAggregateFactor: 0.555
        }

        maxNumberOfDecimals = 2
        validationType = 'aggregate'
      })

      it("fails the validation with the message 'The aggregate must contain no more than 2 decimal places'", () => {
        const result = AdjustmentFactorValidator.go(payload.amendedAggregateFactor, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The aggregate must contain no more than 2 decimal places')
      })
    })

    describe('because the user entered a value greater than 1', () => {
      beforeEach(() => {
        payload = {
          amendedAggregateFactor: 1.1
        }

        maxNumberOfDecimals = 2
        validationType = 'aggregate'
      })

      it("fails the validation with the message 'The aggregate factor must be less than 1'", () => {
        const result = AdjustmentFactorValidator.go(payload.amendedAggregateFactor, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The aggregate factor must be less than 1')
      })
    })

    describe('because the user entered a value less than 0', () => {
      beforeEach(() => {
        payload = {
          amendedAggregateFactor: -1
        }

        maxNumberOfDecimals = 2
        validationType = 'aggregate'
      })

      it("fails the validation with the message 'The aggregate factor must be greater than 0'", () => {
        const result = AdjustmentFactorValidator.go(payload.amendedAggregateFactor, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The aggregate factor must be greater than 0')
      })
    })
  })

  describe('when an invalid payload is provided for the charge factor', () => {
    describe('because nothing was entered', () => {
      beforeEach(() => {
        payload = undefined

        maxNumberOfDecimals = 15
        validationType = 'charge'
      })

      it("fails the validation with the message 'Enter a charge factor'", () => {
        const result = AdjustmentFactorValidator.go(payload, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a charge factor')
      })
    })

    describe('because the user entered text', () => {
      beforeEach(() => {
        payload = {
          amendedChargeFactor: 'Hello World'
        }

        maxNumberOfDecimals = 15
        validationType = 'charge'
      })

      it("fails the validation with the message 'The charge factor must be a number'", () => {
        const result = AdjustmentFactorValidator.go(payload.amendedChargeFactor, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The charge factor must be a number')
      })
    })

    describe('because the user entered too many decimal places', () => {
      beforeEach(() => {
        payload = {
          amendedChargeFactor: 0.5555555555555555
        }

        maxNumberOfDecimals = 15
        validationType = 'charge'
      })

      it("fails the validation with the message 'The charge must contain no more than 2 decimal places'", () => {
        const result = AdjustmentFactorValidator.go(payload.amendedChargeFactor, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The charge must contain no more than 15 decimal places')
      })
    })

    describe('because the user entered a value greater than 1', () => {
      beforeEach(() => {
        payload = {
          amendedChargeFactor: 1.1
        }

        maxNumberOfDecimals = 15
        validationType = 'charge'
      })

      it("fails the validation with the message 'The charge factor must be less than 1'", () => {
        const result = AdjustmentFactorValidator.go(payload.amendedChargeFactor, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The charge factor must be less than 1')
      })
    })

    describe('because the user entered a value less than 0', () => {
      beforeEach(() => {
        payload = {
          amendedChargeFactor: -1
        }

        maxNumberOfDecimals = 15
        validationType = 'charge'
      })

      it("fails the validation with the message 'The charge factor must be greater than 0'", () => {
        const result = AdjustmentFactorValidator.go(payload.amendedChargeFactor, maxNumberOfDecimals, validationType)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The charge factor must be greater than 0')
      })
    })
  })
})
