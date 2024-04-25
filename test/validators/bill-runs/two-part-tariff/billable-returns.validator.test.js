'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BillableReturnsValidator = require('../../../../app/validators/bill-runs/two-part-tariff/billable-returns.validator.js')

describe('Billable Returns validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the authorised volume option', () => {
      beforeEach(() => {
        payload = {
          'quantity-options': '25'
        }
      })

      it('confirms the payload is valid', () => {
        const result = BillableReturnsValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user entered a valid volume', () => {
      beforeEach(() => {
        payload = {
          'quantity-options': 'customQuantity',
          customQuantity: '123456'
        }
      })

      it('confirms the payload is valid', () => {
        const result = BillableReturnsValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it("fails the validation with the message 'You must choose or enter a value'", () => {
        const result = BillableReturnsValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('You must choose or enter a value')
      })
    })

    describe('because the user selected to enter a custom quantity', () => {
      describe('but entered no value', () => {
        beforeEach(() => {
          payload = { 'quantity-options': 'customQuantity' }
        })

        it("fails validation with the message 'You must enter a custom quantity'", () => {
          const result = BillableReturnsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('You must enter a custom quantity')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload = {
            'quantity-options': 'customQuantity',
            customQuantity: 'Hello world'
          }
        })

        it("fails validation with the message 'You must enter a number'", () => {
          const result = BillableReturnsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('You must enter a number')
        })
      })

      describe('but entered a number with more than 6 decimal places', () => {
        beforeEach(() => {
          payload = {
            'quantity-options': 'customQuantity',
            customQuantity: '12.3456789'
          }
        })

        it("fails validation with the message 'You must enter less than 6 decimal places'", () => {
          const result = BillableReturnsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('You must enter less than 6 decimal places')
        })
      })
    })
  })
})
