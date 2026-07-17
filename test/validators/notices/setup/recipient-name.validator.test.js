// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import RecipientNameValidator from '../../../../app/validators/notices/setup/recipient-name.validator.js'

describe('Notices - Setup - Recipient Name Validator', () => {
  let payload

  beforeEach(() => {
    payload = { name: 'Ronald Weasley' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = RecipientNameValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with no payload', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = RecipientNameValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual("Enter the recipient's name")
    })
  })
})
