'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const __MODULE_NAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let session

  beforeEach(async () => {})

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = __MODULE_NAME__.go(session.id)

      expect(result).to.equal({})
    })
  })

  describe('when called with valid data', () => {
    it('returns with errors', () => {
      const result = __MODULE_NAME__.go(session.id)

      expect(result).to.equal({})
    })
  })
})
