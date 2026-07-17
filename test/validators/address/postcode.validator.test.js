// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import PostcodeValidator from '../../../app/validators/address/postcode.validator.js'

describe('Address - Postcode Validator', () => {
  let payload

  beforeEach(() => {
    payload = { postcode: 'SW1A 1AA' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = PostcodeValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with no postcode', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = PostcodeValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter a UK postcode')
    })
  })

  describe('when called with an invalid postcode', () => {
    beforeEach(() => {
      payload = { postcode: 'notapostcode' }
    })

    it('returns with errors', () => {
      const result = PostcodeValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter a valid UK postcode')
    })
  })
})
