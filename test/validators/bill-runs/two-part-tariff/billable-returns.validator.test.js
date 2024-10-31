'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const BillableReturnsValidator = require('../../../../app/validators/bill-runs/two-part-tariff/billable-returns.validator.js')

describe('Billable Returns validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the authorised volume option', () => {
      beforeEach(() => {
        payload = {
          'quantity-options': 25,
          authorisedVolume: 30
        }
      })

      it('confirms the payload is valid', () => {
        const result = BillableReturnsValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user entered a valid volume (less than the authorised volume but greater than 0)', () => {
      beforeEach(() => {
        payload = {
          'quantity-options': 'customQuantity',
          customQuantity: 12,
          authorisedVolume: 30
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
        payload = {
          authorisedVolume: 30
        }
      })

      it('fails the validation with the message "Select the billable quantity"', () => {
        const result = BillableReturnsValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the billable quantity')
      })
    })

    describe('because the user selected to enter a custom quantity', () => {
      describe('but entered no value', () => {
        beforeEach(() => {
          payload = {
            'quantity-options': 'customQuantity',
            authorisedVolume: 25
          }
        })

        it('fails validation with the message "Enter the billable quantity"', () => {
          const result = BillableReturnsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter the billable quantity')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload = {
            'quantity-options': 'customQuantity',
            customQuantity: 'Hello world',
            authorisedVolume: 25
          }
        })

        it('fails validation with the message "The quantity must be a number"', () => {
          const result = BillableReturnsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The quantity must be a number')
        })
      })

      describe('but entered a number with more than 6 decimal places', () => {
        beforeEach(() => {
          payload = {
            'quantity-options': 'customQuantity',
            customQuantity: 12.3456789,
            authorisedVolume: 25
          }
        })

        it('fails validation with the message "The quantity must contain no more than 6 decimal places"', () => {
          const result = BillableReturnsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The quantity must contain no more than 6 decimal places')
        })
      })

      describe('but entered a number less than 0', () => {
        beforeEach(() => {
          payload = {
            'quantity-options': 'customQuantity',
            customQuantity: -0.1,
            authorisedVolume: 25
          }
        })

        it('fails validation with the message "The quantity must be zero or higher"', () => {
          const result = BillableReturnsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The quantity must be zero or higher')
        })
      })

      describe('but entered a number greater than the authorised annual quantity', () => {
        beforeEach(() => {
          payload = {
            'quantity-options': 'customQuantity',
            customQuantity: 40,
            authorisedVolume: 25
          }
        })

        it('fails validation with the message "The quantity must be the same as or less than the authorised amount"', () => {
          const result = BillableReturnsValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The quantity must be the same as or less than the authorised amount')
        })
      })
    })
  })
})
