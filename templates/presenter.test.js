'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const __MODULENAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let session

  beforeEach(async () => {})

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await __MODULENAME__.go(session.id)

      expect(result).to.equal({})
    })
  })
})
