// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import SelectRecipientsValidator from '../../../../app/validators/notices/setup/select-recipients.validator.js'

describe('Select Recipients Validator', () => {
  let payload

  beforeEach(() => {
    payload = { recipients: ['123'] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = SelectRecipientsValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('when the payload is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = SelectRecipientsValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select at least one recipient')
      })
    })

    describe('when the array is empty', () => {
      beforeEach(() => {
        payload = { recipients: [] }
      })

      it('returns with errors', () => {
        const result = SelectRecipientsValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select at least one recipient')
      })
    })
  })
})
