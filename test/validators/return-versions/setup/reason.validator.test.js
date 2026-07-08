'use strict'

// Thing under test
const ReasonValidator = require('../../../../app/validators/return-versions/setup/reason.validator.js')

describe('Return Versions Setup - Reason validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = ReasonValidator({ reason: 'new-licence' })

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when valid data is provided', () => {
    describe('because no "reason" is given', () => {
      it('fails validation', () => {
        const result = ReasonValidator({ reason: '' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the reason for the requirements for returns')
      })
    })

    describe('because an unknown "reason" is given', () => {
      it('fails validation', () => {
        const result = ReasonValidator({ reason: 'just-because' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the reason for the requirements for returns')
      })
    })
  })
})
