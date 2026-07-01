'use strict'

// Thing under test
const __MODULE_NAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let payload

  beforeEach(() => {
    payload = { placeholder: '' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = __MODULE_NAME__.go(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = __MODULE_NAME__.go(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('"placeholder" is required')
    })
  })
})
