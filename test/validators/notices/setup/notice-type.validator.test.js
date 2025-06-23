'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = NoticeTypeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select the notice type')
    })
  })
})
