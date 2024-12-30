'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

// Thing under test
const EditValidator = require('../../../../app/validators/bill-runs/review/edit.validator.js')

describe('Bill Runs Review - Edit validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('because the user selected the authorised volume option', () => {
      beforeEach(() => {
        payload = { quantityOptions: 25, authorisedVolume: 30 }
      })

      it('confirms the data is valid', () => {
        const result = EditValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('because the user entered a valid custom volume (less than the authorised volume but greater than 0)', () => {
      beforeEach(() => {
        payload = { quantityOptions: 'customQuantity', customQuantity: 12, authorisedVolume: 30 }
      })

      it('confirms the data is valid', () => {
        const result = EditValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = { authorisedVolume: 30 }
      })

      it('fails the validation with the message "Select the billable quantity"', () => {
        const result = EditValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the billable quantity')
      })
    })

    describe('because the user selected to enter a custom quantity', () => {
      describe('but entered no value', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', authorisedVolume: 25 }
        })

        it('fails validation with the message "Enter the billable quantity"', () => {
          const result = EditValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter the billable quantity')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: 'Hello world', authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must be a number"', () => {
          const result = EditValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The quantity must be a number')
        })
      })

      describe('but entered a number with more than 6 decimal places', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: 12.3456789, authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must contain no more than 6 decimal places"', () => {
          const result = EditValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The quantity must contain no more than 6 decimal places')
        })
      })

      describe('but entered a number less than 0', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: -0.1, authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must be zero or higher"', () => {
          const result = EditValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('The quantity must be zero or higher')
        })
      })

      describe('but entered a number greater than the authorised annual quantity', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: 40, authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must be the same as or less than the authorised amount"', () => {
          const result = EditValidator.go(payload)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal(
            'The quantity must be the same as or less than the authorised amount'
          )
        })
      })
    })
  })
})
