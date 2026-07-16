// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import EditValidator from '../../../../app/validators/bill-runs/review/edit.validator.js'

describe('Bill Runs Review - Edit validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('because the user selected the authorised volume option', () => {
      beforeEach(() => {
        payload = { quantityOptions: 25, authorisedVolume: 30 }
      })

      it('confirms the data is valid', () => {
        const result = EditValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('because the user entered a valid custom volume (less than the authorised volume but greater than 0)', () => {
      beforeEach(() => {
        payload = { quantityOptions: 'customQuantity', customQuantity: 12, authorisedVolume: 30 }
      })

      it('confirms the data is valid', () => {
        const result = EditValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = { authorisedVolume: 30 }
      })

      it('fails the validation with the message "Select the billable quantity"', () => {
        const result = EditValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the billable quantity')
      })
    })

    describe('because the user selected to enter a custom quantity', () => {
      describe('but entered no value', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', authorisedVolume: 25 }
        })

        it('fails validation with the message "Enter the billable quantity"', () => {
          const result = EditValidator(payload)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Enter the billable quantity')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: 'Hello world', authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must be a number"', () => {
          const result = EditValidator(payload)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('The quantity must be a number')
        })
      })

      describe('but entered a number with more than 6 decimal places', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: 12.3456789, authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must contain no more than 6 decimal places"', () => {
          const result = EditValidator(payload)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('The quantity must contain no more than 6 decimal places')
        })
      })

      describe('but entered a number less than 0', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: -0.1, authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must be zero or higher"', () => {
          const result = EditValidator(payload)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('The quantity must be zero or higher')
        })
      })

      describe('but entered a number greater than the authorised annual quantity', () => {
        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: 40, authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must be the same as or less than the authorised amount"', () => {
          const result = EditValidator(payload)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'The quantity must be the same as or less than the authorised amount'
          )
        })
      })

      describe('but entered an unsafe number', () => {
        const MAX_SAFE_NUMBER = 9007199254740991

        beforeEach(() => {
          payload = { quantityOptions: 'customQuantity', customQuantity: MAX_SAFE_NUMBER + 1, authorisedVolume: 25 }
        })

        it('fails validation with the message "The quantity must be between zero and the authorised amount"', () => {
          const result = EditValidator(payload)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('The quantity must be between zero and the authorised amount')
        })
      })
    })
  })
})
