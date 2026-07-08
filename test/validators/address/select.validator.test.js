'use strict'

// Thing under test
const SelectValidator = require('../../../app/validators/address/select.validator.js')

describe('Address - Select Validator', () => {
  let payload

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = { addresses: '1234567' }
    })

    it('returns with no errors', () => {
      const result = SelectValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = { addresses: 'select' }
    })

    it('returns with errors', () => {
      const result = SelectValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select an address')
    })
  })

  describe('when called with no data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = SelectValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select an address')
    })
  })
})
