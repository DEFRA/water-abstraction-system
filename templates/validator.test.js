'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const __MODULE_NAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let payload

  beforeEach(() => {
    payload = {}
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = __MODULE_NAME__.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    it('returns with errors', () => {
      const result = __MODULE_NAME__.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('')
    })
  })
})
