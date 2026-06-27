'use strict'

// Thing under test
const NoticeTypeValidator = require('../../../../app/validators/notices/setup/notice-type.validator.js')

describe('Notice Type Validator', () => {
  let payload

  beforeEach(() => {
    payload = { noticeType: '' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = NoticeTypeValidator.go(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = NoticeTypeValidator.go(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select the notice type')
    })
  })
})
