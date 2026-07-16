// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import AuthorisedValidator from '../../../../app/validators/bill-runs/review/authorised.validator.js'

describe('Bill Runs Review - Authorised validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = { amendedAuthorisedVolume: '10', totalBillableReturns: '5' }
    })

    it('confirms the data is valid', () => {
      const result = AuthorisedValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because the user did not enter an authorised volume', () => {
      beforeEach(() => {
        payload = { totalBillableReturns: '5' }
      })

      it('fails the validation with the message "Enter an authorised volume"', () => {
        const result = AuthorisedValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter an authorised volume')
      })
    })

    describe('because the user entered text', () => {
      beforeEach(() => {
        payload = { amendedAuthorisedVolume: 'Hello World', totalBillableReturns: '5' }
      })

      it('fails the validation with the message "The authorised volume must be a number"', () => {
        const result = AuthorisedValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('The authorised volume must be a number')
      })
    })

    describe('because the user entered a number less than the totalBillableReturns', () => {
      beforeEach(() => {
        payload = { amendedAuthorisedVolume: '5', totalBillableReturns: '6' }
      })

      it('fails the validation with the message "The authorised volume must be greater than 6"', () => {
        const result = AuthorisedValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('The authorised volume must be greater than 6')
      })
    })

    describe('because the user entered too many decimal places', () => {
      beforeEach(() => {
        payload = { amendedAuthorisedVolume: '15.1234567', totalBillableReturns: '5' }
      })

      it('fails the validation with the message "The authorised volume must not have more than 6 decimal places"', () => {
        const result = AuthorisedValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'The authorised volume must not have more than 6 decimal places'
        )
      })
    })
  })
})
