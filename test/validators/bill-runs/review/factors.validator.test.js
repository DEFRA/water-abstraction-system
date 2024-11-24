'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const FactorsValidator = require('../../../../app/validators/bill-runs/review/factors.validator.js')

describe('Bill Runs Review - Factors validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = { amendedAggregate: 0.5, amendedChargeAdjustment: 0.5 }
    })

    it('confirms the data is valid', () => {
      const result = FactorsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because nothing was entered', () => {
      beforeEach(() => {
        // NOTE: Confirmed in manual testing. Payload mya have no properties, but it itself is never undefined
        payload = {}
      })

      it('fails the validation with the messages "Enter an aggregate factor" and "Enter a charge factor"', () => {
        const result = FactorsValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter an aggregate factor')
        expect(result.error.details[1].message).to.equal('Enter a charge factor')
      })
    })

    describe('and the aggregate factor is the issue', () => {
      beforeEach(() => {
        payload = { amendedChargeAdjustment: 0.5 }
      })

      describe('because nothing was entered', () => {
        it('fails the validation with the message "Enter a aggregate factor"', () => {
          const result = FactorsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter an aggregate factor')
        })
      })

      describe('because the user entered text', () => {
        beforeEach(() => {
          payload.amendedAggregate = 'Hello World'
        })

        it('fails the validation with the message "The aggregate factor must be a number"', () => {
          const result = FactorsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The aggregate factor must be a number')
        })
      })

      describe('because the user entered too many decimal places', () => {
        beforeEach(() => {
          payload.amendedAggregate = 0.1234567890123456
        })

        it('fails the validation with the message "The aggregate factor must not have more than 15 decimal places"', () => {
          const result = FactorsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal(
            'The aggregate factor must not have more than 15 decimal places'
          )
        })
      })

      describe('because the user entered a value less than 0', () => {
        beforeEach(() => {
          payload.amendedAggregate = -1
        })

        it('fails the validation with the message "The aggregate factor must be greater than 0"', () => {
          const result = FactorsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The aggregate factor must be greater than 0')
        })
      })
    })

    describe('and the charge factor is the issue', () => {
      beforeEach(() => {
        payload = { amendedAggregate: 0.5 }
      })

      describe('because nothing was entered', () => {
        it('fails the validation with the message "Enter a charge factor"', () => {
          const result = FactorsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a charge factor')
        })
      })

      describe('because the user entered text', () => {
        beforeEach(() => {
          payload.amendedChargeAdjustment = 'Hello World'
        })

        it('fails the validation with the message "The charge factor must be a number"', () => {
          const result = FactorsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The charge factor must be a number')
        })
      })

      describe('because the user entered too many decimal places', () => {
        beforeEach(() => {
          payload.amendedChargeAdjustment = 0.5555555555555555
        })

        it('fails the validation with the message "The charge factor must not have more than 15 decimal places"', () => {
          const result = FactorsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal(
            'The charge factor must not have more than 15 decimal places'
          )
        })
      })

      describe('because the user entered a value less than 0', () => {
        beforeEach(() => {
          payload.amendedChargeAdjustment = -1
        })

        it('fails the validation with the message "The charge factor must be greater than 0"', () => {
          const result = FactorsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The charge factor must be greater than 0')
        })
      })
    })
  })
})
