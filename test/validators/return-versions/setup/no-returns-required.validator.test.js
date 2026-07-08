'use strict'

// Thing under test
const NoReturnsRequiredValidator = require('../../../../app/validators/return-versions/setup/no-returns-required.validator.js')

describe('Return Versions Setup - No Returns Required validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = NoReturnsRequiredValidator({ reason: 'licence-conditions-do-not-require-returns' })

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when valid data is provided', () => {
    describe('because no "reason" is given', () => {
      it('fails validation', () => {
        const result = NoReturnsRequiredValidator({ reason: '' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the reason for no returns required')
      })
    })

    describe('because an unknown "reason" is given', () => {
      it('fails validation', () => {
        const result = NoReturnsRequiredValidator({ reason: 'no-water' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the reason for no returns required')
      })
    })
  })
})
